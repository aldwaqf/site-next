// Toutes les routes d'Auth.js (login, logout, session...)
// passent par ce fichier "attrape-tout" : /api/auth/*
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
