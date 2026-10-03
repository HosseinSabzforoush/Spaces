#include "IconExtractor.h"

#include <windows.h>
#include <objbase.h>
#include <shellapi.h>
#include <wincodec.h>

namespace {

template <typename T>
class ComPtr {
public:
    ComPtr() = default;
    ~ComPtr() { reset(); }

    ComPtr(const ComPtr&) = delete;
    ComPtr& operator=(const ComPtr&) = delete;

    T** put() {
        reset();
        return &ptr_;
    }
    T* get() const { return ptr_; }
    T* operator->() const { return ptr_; }

private:
    void reset() {
        if (ptr_ != nullptr) {
            ptr_->Release();
            ptr_ = nullptr;
        }
    }
    T* ptr_ = nullptr;
};

class IconGuard {
public:
    explicit IconGuard(HICON icon) : icon_(icon) {}
    ~IconGuard() {
        if (icon_ != nullptr) {
            DestroyIcon(icon_);
        }
    }
    IconGuard(const IconGuard&) = delete;
    IconGuard& operator=(const IconGuard&) = delete;

    HICON get() const { return icon_; }

private:
    HICON icon_;
};

} 

namespace IconExtractor {

std::optional<std::vector<unsigned char>> extractPng(const std::wstring& filePath) {
    if (filePath.empty()) {
        return std::nullopt;
    }

    SHFILEINFOW info{};
    const DWORD_PTR found = SHGetFileInfoW(
        filePath.c_str(), 0, &info, sizeof(info),
        SHGFI_ICON | SHGFI_LARGEICON);

    if (found == 0 || info.hIcon == nullptr) {
        return std::nullopt;
    }
    IconGuard icon(info.hIcon);

    ComPtr<IWICImagingFactory> factory;
    if (FAILED(CoCreateInstance(CLSID_WICImagingFactory, nullptr, CLSCTX_INPROC_SERVER,
                                IID_IWICImagingFactory,
                                reinterpret_cast<void**>(factory.put())))) {
        return std::nullopt;
    }

    ComPtr<IWICBitmap> bitmap;
    if (FAILED(factory->CreateBitmapFromHICON(icon.get(), bitmap.put()))) {
        return std::nullopt;
    }

    ComPtr<IWICFormatConverter> converter;
    if (FAILED(factory->CreateFormatConverter(converter.put()))) {
        return std::nullopt;
    }
    if (FAILED(converter->Initialize(bitmap.get(), GUID_WICPixelFormat32bppBGRA,
                                     WICBitmapDitherTypeNone, nullptr, 0.0,
                                     WICBitmapPaletteTypeCustom))) {
        return std::nullopt;
    }

    UINT width = 0;
    UINT height = 0;
    if (FAILED(converter->GetSize(&width, &height)) || width == 0 || height == 0) {
        return std::nullopt;
    }

    ComPtr<IStream> stream;
    if (FAILED(CreateStreamOnHGlobal(nullptr, TRUE, stream.put()))) {
        return std::nullopt;
    }

    ComPtr<IWICBitmapEncoder> encoder;
    if (FAILED(factory->CreateEncoder(GUID_ContainerFormatPng, nullptr, encoder.put()))) {
        return std::nullopt;
    }
    if (FAILED(encoder->Initialize(stream.get(), WICBitmapEncoderNoCache))) {
        return std::nullopt;
    }

    ComPtr<IWICBitmapFrameEncode> frame;
    if (FAILED(encoder->CreateNewFrame(frame.put(), nullptr))) {
        return std::nullopt;
    }
    if (FAILED(frame->Initialize(nullptr))) {
        return std::nullopt;
    }
    if (FAILED(frame->SetSize(width, height))) {
        return std::nullopt;
    }

    WICPixelFormatGUID format = GUID_WICPixelFormat32bppBGRA;
    if (FAILED(frame->SetPixelFormat(&format))) {
        return std::nullopt;
    }
    if (FAILED(frame->WriteSource(converter.get(), nullptr))) {
        return std::nullopt;
    }
    if (FAILED(frame->Commit()) || FAILED(encoder->Commit())) {
        return std::nullopt;
    }

    STATSTG stats{};
    if (FAILED(stream->Stat(&stats, STATFLAG_NONAME))) {
        return std::nullopt;
    }
    const SIZE_T size = static_cast<SIZE_T>(stats.cbSize.QuadPart);
    if (size == 0) {
        return std::nullopt;
    }

    HGLOBAL memory = nullptr;
    if (FAILED(GetHGlobalFromStream(stream.get(), &memory)) || memory == nullptr) {
        return std::nullopt;
    }

    const void* locked = GlobalLock(memory);
    if (locked == nullptr) {
        return std::nullopt;
    }

    std::vector<unsigned char> bytes(size);
    CopyMemory(bytes.data(), locked, size);
    GlobalUnlock(memory);

    return bytes;
}

} 