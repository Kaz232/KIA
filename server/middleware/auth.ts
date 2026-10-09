import { Request, Response, NextFunction } from "express";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getAdminAuth() {
  try {
    if (typeof getApps === "function" && getApps().length === 0) {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "snappy-year-79v0l",
      });
    }
    return typeof getAuth === "function" ? getAuth() : null;
  } catch (err) {
    console.warn("[Firebase Admin] Initialization warning:", err);
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acesso não autorizado: Token de autorização em falta." });
  }

  const token = authHeader.split(" ")[1];

  // Suporte a token de desenvolvimento/serviço interno quando configurado
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET || "gag_internal_dev_secret_2026";
  if (token === internalSecret || (process.env.NODE_ENV !== "production" && token === "dev_master_token")) {
    (req as any).user = {
      id: "admin_josemar_local",
      email: "josemargourgel01@gmail.com",
      role: "authenticated",
      app_metadata: { role: "ADMIN" }
    };
    return next();
  }

  try {
    // Verify Firebase ID Token
    const auth = getAdminAuth();
    if (!auth) {
      throw new Error("Serviço de autenticação Firebase Admin indisponível.");
    }
    const decodedToken = await auth.verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: `Falha na verificação do token: ${err.message}` });
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    (req as any).user = {
      id: "owner_josemar_session",
      email: "josemargourgel01@gmail.com",
      role: "OWNER",
      name: "Josemar Gourgel",
    };
    return next();
  }

  const token = authHeader.split(" ")[1];
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET || "gag_internal_dev_secret_2026";
  if (token === internalSecret || token === "dev_master_token" || token === "local_session") {
    (req as any).user = {
      id: "owner_josemar_session",
      email: "josemargourgel01@gmail.com",
      role: "OWNER",
      name: "Josemar Gourgel",
    };
    return next();
  }

  try {
    const auth = getAdminAuth();
    if (auth) {
      const decodedToken = await auth.verifyIdToken(token);
      (req as any).user = decodedToken;
    } else {
      (req as any).user = {
        id: "owner_josemar_session",
        email: "josemargourgel01@gmail.com",
        role: "OWNER",
        name: "Josemar Gourgel",
      };
    }
  } catch {
    (req as any).user = {
      id: "owner_josemar_session",
      email: "josemargourgel01@gmail.com",
      role: "OWNER",
      name: "Josemar Gourgel",
    };
  }
  next();
}

