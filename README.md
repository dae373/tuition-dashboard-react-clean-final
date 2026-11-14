# 대학 등록금 React 대시보드 — Vercel 수정판

이 프로젝트는 Vercel의 `TS18003` 오류를 방지하도록 프로젝트 구조와 TypeScript 설정을 수정한 버전입니다.

## 주요 수정사항

- `tsconfig.app.json` 프로젝트 참조 구조 제거
- 단일 `tsconfig.json` 사용
- `include`를 `src/**/*.ts`, `src/**/*.tsx`로 명시
- ZIP 최상위에 `package.json`, `src`, `index.html` 배치
- `vercel.json` 추가
- 빌드 명령을 `tsc --noEmit && vite build`로 변경

## 로컬 실행

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## Vercel 배포

저장소 루트에 다음 항목이 바로 보여야 합니다.

```text
package.json
tsconfig.json
vite.config.ts
vercel.json
index.html
src/
```

Vercel 설정:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: 저장소 루트

기존 프로젝트가 하위 폴더에 있다면 Vercel의 Root Directory를 해당 폴더로 지정하세요.
