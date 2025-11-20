"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B1B34] px-4">
      <div className="flex w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-[#06121F]">
        
        {/* LADO IZQUIERDO */}
        <div className="w-1/2 bg-[#06121F] text-white p-10 flex flex-col justify-center items-center relative">
          <Link href="/" className="mb-6 block">
            <Image src="/evaltia-logo.png" alt="Logo Evaltia" width={70} height={70} />
          </Link>
          <h2 className="text-xl font-bold text-center mb-4">¡Bienvenido de nuevo!</h2>
          <p className="text-sm text-center text-gray-300 max-w-xs">
            Conéctate y continúa tu camino con simulacros personalizados.
          </p>
        </div>

        {/* LADO DERECHO */}
        <div className="w-1/2 bg-[#1A2235] p-10 text-white">
          <h2 className="text-2xl font-bold mb-2">Inicia sesión</h2>
          <p className="text-sm text-gray-400 mb-6">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/register" className="text-[#00B4D8] hover:underline">
              Regístrate
            </Link>
          </p>

          <form className="space-y-5">
            {/* Correo */}
            <input
              type="email"
              placeholder="Ingresa tu correo"
              required
              className="w-full px-4 py-2 rounded-md bg-[#0F172A] border border-gray-600 text-white placeholder-gray-400"
            />

            {/* Contraseña */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                required
                className="w-full px-4 py-2 pr-12 rounded-md bg-[#0F172A] border border-gray-600 text-white placeholder-gray-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? (
                  // Ojo tachado
                  <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Ojo abierto
                  <svg fill="none" strokeWidth="1.5" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-[#00B4D8] hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00B4D8] text-white py-2 rounded-md font-semibold hover:bg-[#009ec2] transition"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}