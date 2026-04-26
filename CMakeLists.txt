cmake_minimum_required(VERSION 3.15)
project(truaudit_api)

set(CMAKE_CXX_STANDARD 20)

find_package(Crow CONFIG REQUIRED)
find_package(libpqxx CONFIG REQUIRED)
find_package(jwt-cpp CONFIG REQUIRED)

include_directories(include)

add_executable(truaudit_api main.cpp)

target_link_libraries(truaudit_api PRIVATE 
    Crow::Crow 
    libpqxx::pqxx
    jwt-cpp::jwt-cpp
    ws2_32 
    mswsock
)