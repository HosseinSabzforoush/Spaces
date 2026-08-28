#pragma once
#include <windows.h>

class ComInitializer{

private:
    bool valid;
    void close();
    bool destruct;
    
public:
    ComInitializer();
    ~ComInitializer();

    ComInitializer(const ComInitializer&) = delete;
    ComInitializer& operator=(const ComInitializer&) = delete;

    explicit operator bool() const;
};