"use strict";

/**
 * Handler d'authentification.
 * Ce fichier contient uniquement la logique du login.
 */

module.exports = function registerLoginHandler(srv, entities, helpers) {
    const { Users } = entities;
    const { reject } = helpers;

    srv.on("login", async (req) => {
        const email = req.data.email || req.data.username;
        const { password } = req.data;

        if (!email || !password) {
            return reject(req, "E-mail et mot de passe requis.");
        }

        let user = await SELECT.one
            .from(Users)
            .where({
                email: email,
                password: password
            });

        if (!user) {
            user = await SELECT.one
                .from(Users)
                .where({
                    username: email,
                    password: password
                });
        }

        if (!user) {
            return reject(req, "Identifiants incorrects.", 401);
        }

        if (!user.active) {
            return reject(req, "Utilisateur inactif.", 403);
        }

        return {
            ID: user.ID,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            active: user.active
        };
    });
};