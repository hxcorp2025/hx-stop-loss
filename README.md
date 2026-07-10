# HX Stop Loss — Landing Page

LP de aplicação do HX Stop Loss: intervenção operacional de 30 a 60 dias para negócios digitais que já vendem.

- **Stack:** HTML + CSS + JS vanilla, zero dependências de build. Fontes via Google Fonts (Archivo, Inter, JetBrains Mono).
- **Direção visual:** "sala de operação" — escuro dominante, carmesim (vazamento) e verde (controle), fio narrativo que percorre a página.
- **Tracking:** captura e persiste UTMs + fbclid/gclid (localStorage, 90 dias), monta FBC no formato oficial e envia junto da aplicação. Slots pra pixel Meta (`fbq`) e GTM (`dataLayer`) já no submit.
- **Form:** validação client-side; endpoint configurável em `CONFIG.FORM_ENDPOINT` no `script.js` (pendente: apontar pro webhook n8n).

Copy e direção aprovadas em 10/07/2026 (docs no repo interno `hxcorp2025/claude-config`, contexto/HX_AQUISICAO).
