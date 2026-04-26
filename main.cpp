#include "crow.h"
#include "db.h"

int main() {
    crow::SimpleApp app;

    // ── Health check ──────────────────────────────────────────
    CROW_ROUTE(app, "/")([](){
        return "TruAudit API is running.";
    });

    // ── Auth ──────────────────────────────────────────────────
    CROW_ROUTE(app, "/auth/login")
    .methods("POST"_method)
    ([](const crow::request& req){
        return crow::response(200, "login placeholder");
    });

    // ── Audits ────────────────────────────────────────────────
    CROW_ROUTE(app, "/audits")
    .methods("POST"_method)
    ([](const crow::request& req){
        return crow::response(200, "create audit placeholder");
    });

    CROW_ROUTE(app, "/audits")
    .methods("GET"_method)
    ([](const crow::request& req){
        return crow::response(200, "get audits placeholder");
    });

    CROW_ROUTE(app, "/audits/<int>/submit")
    .methods("PUT"_method)
    ([](const crow::request& req, int id){
        return crow::response(200, "submit audit placeholder");
    });

    CROW_ROUTE(app, "/audits/<int>/review")
    .methods("PUT"_method)
    ([](const crow::request& req, int id){
        return crow::response(200, "review audit placeholder");
    });

    CROW_ROUTE(app, "/audits/<int>/close")
    .methods("PUT"_method)
    ([](const crow::request& req, int id){
        return crow::response(200, "close audit placeholder");
    });

    // ── Corrective Actions ────────────────────────────────────
    CROW_ROUTE(app, "/corrective_actions/<int>/resolve")
    .methods("PUT"_method)
    ([](const crow::request& req, int id){
        return crow::response(200, "resolve corrective action placeholder");
    });

    // ── Recommendations ───────────────────────────────────────
    CROW_ROUTE(app, "/recommendations")
    .methods("POST"_method)
    ([](const crow::request& req){
        return crow::response(200, "create recommendation placeholder");
    });

    CROW_ROUTE(app, "/recommendations")
    .methods("GET"_method)
    ([](const crow::request& req){
        return crow::response(200, "get recommendations placeholder");
    });

    CROW_ROUTE(app, "/recommendations/<int>/address")
    .methods("PUT"_method)
    ([](const crow::request& req, int id){
        return crow::response(200, "address recommendation placeholder");
    });

    // ── Departments ───────────────────────────────────────────
    CROW_ROUTE(app, "/departments")
    .methods("GET"_method)
    ([](const crow::request& req){
        return crow::response(200, "get departments placeholder");
    });

    app.port(8080).multithreaded().run();
    return 0;
}