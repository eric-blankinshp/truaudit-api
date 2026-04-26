cmake_minimum_required(VERSION 3.15)
project(truaudit_api)

set(CMAKE_CXX_STANDARD 17)

find_package(Crow CONFIG REQUIRED)

add_executable(truaudit_api main.cpp)

target_link_libraries(truaudit_api PRIVATE Crow::Crow ws2_32 mswsock)