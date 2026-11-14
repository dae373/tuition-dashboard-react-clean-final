# Vercel 배포용 클린 프로젝트

이 프로젝트는 이전 버전의 사용하지 않는 components, hooks, utils 파일을 모두 제거했습니다.

## 저장소 최상위 구조

package.json
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
vercel.json
index.html
src/
  App.tsx
  main.tsx
  styles.css
  types.ts
  vite-env.d.ts
  data/
    records.json
    changes.json

## 중요

기존 프로젝트에 덮어쓰지 말고 새 저장소에 이 ZIP의 내용만 올리는 것을 권장합니다.
기존 저장소의 src/components, src/hooks, src/utils가 남아 있으면 이전 타입 오류가 다시 발생할 수 있습니다.

## Vercel 설정

Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Root Directory: 비워두기
