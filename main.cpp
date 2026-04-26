#include "crow.h"

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/")([](){
        return "TruAudit API is running.";
    });

    app.port(8080).multithreaded().run();
    return 0;
}

