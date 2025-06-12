#!/bin/bash

# Reemplazar toda la sección del User Menu
sed -i '' '/User Menu COMPLETO del header premium/,/Mobile menu button/{
s/.*User Menu COMPLETO del header premium.*/          {/* User Menu COMPLETO del header premium *\/}/
s/.*Sign in button para usuarios no autenticados.*/          <div className="hidden md:flex md:items-center md:space-x-4">/
s/.*{!currentUser ? (/{!currentUser ? (/
s/.*<Button/<Button/
s/.*variant="outline"/variant="outline"/
s/.*onClick={() => router.push("\/auth\/login")}/onClick={() => router.push("\/auth\/login")}/
s/.*className="ml-4"/className="ml-4"/
s/.*>/>/ 
s/.*Sign in/Sign in/
s/.*<\/Button>/<\/Button>/
s/.*) : (/) : (/
s/.*<div className="hidden md:flex md:items-center md:space-x-4">/            <>/{
}' src/components/layout/Header.tsx

# Agregar el cierre correcto antes del Mobile menu button
sed -i '' '/Mobile menu button/i\
            )}\
          <\/div>' src/components/layout/Header.tsx
