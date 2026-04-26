#pragma once
#include <pqxx/pqxx>
#include <string>

inline pqxx::connection getConnection() {
    return pqxx::connection{
        "dbname=truaudit "
        "user=truaudit_app "
        "password=yourpassword "
        "host=localhost "
        "port=5432"
    };
}