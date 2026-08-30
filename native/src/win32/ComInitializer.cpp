#include "ComInitializer.h"

ComInitializer::ComInitializer(){
    HRESULT result = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    if(FAILED(result)){
        destruct = false;
        valid = false;
    }
    else{
        valid = true;
        if (result == S_OK){
            destruct = true;
        }
        else{
            destruct = false;
        }
    }
}

void ComInitializer::close(){
    if(destruct){
        CoUninitialize();
    }
    destruct = false;
}

ComInitializer::~ComInitializer(){
    close();
}

ComInitializer::operator bool() const{
    return valid;
}