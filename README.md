# Babel vs SWC 성능 벤치마크 도구

JavaScript/TypeScript 빌드 도구인 Babel과 SWC의 성능을 비교하는 벤치마크 도구입니다.

## 목적

- **Babel vs SWC 성능 비교**: JavaScript 기반 vs Rust 기반 컴파일러의 실제 성능 차이 측정
- **대용량 파일 처리**: 10,000개의 TypeScript/React 파일을 대상으로 한 실제적인 성능 테스트
- **메모리 사용량 분석**: 컴파일 과정에서의 메모리 사용 패턴 및 GC 영향 분석
- **개발 환경 최적화**: 프로젝트 규모에 따른 최적의 빌드 도구 선택 가이드 제공

## 벤치마크 기능

### 성능 측정 항목

- ⏱️ **컴파일 시간**: 전체 파일 처리에 소요되는 시간
- 🧠 **메모리 사용량**: 시작/종료 메모리 및 사용량 증가 분석
- 🗑️ **GC 영향도**: 가비지 컬렉션이 성능에 미치는 영향 감지
- 📈 **성능 비교**: 속도 배수 및 메모리 효율성 상대 비교

### 테스트 파일 유형

- **React 컴포넌트**: TypeScript + Hooks + 이벤트 핸들링
- **서비스 클래스**: Generic 타입 + 비동기 처리 + 캐싱
- **유틸리티 함수**: 복잡한 타입 정의 + 함수형 프로그래밍

## 사용 방법

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 벤치마크 실행

```bash
node script.js
```

### 3. 결과 확인

벤치마크 실행 후 다음과 같은 정보를 확인할 수 있습니다:

- 각 도구별 컴파일 시간
- 메모리 사용량 변화
- 성능 비교 분석
- 권장 사항

## 설치된 패키지

### Babel 생태계

- `@babel/cli`: Babel 명령행 도구
- `@babel/core`: Babel 핵심 엔진
- `@babel/preset-env`: 최신 JavaScript 문법 지원
- `@babel/preset-react`: React JSX 변환
- `@babel/preset-typescript`: TypeScript 지원
- `@babel/plugin-transform-class-properties`: 클래스 프로퍼티 변환
- `@babel/plugin-transform-runtime`: 런타임 최적화

### SWC 생태계

- `@swc/cli`: SWC 명령행 도구
- `@swc/core`: SWC 핵심 엔진 (Rust 기반)

## 🔧 벤치마크 설정

`CONFIG` 객체에서 다음 설정을 변경할 수 있습니다:

```javascript
const CONFIG = {
  "fileCount": 10000,           // 생성할 테스트 파일 수
  "outputDir": "./benchmark_files",     // 테스트 파일 디렉토리
  "babelOutputDir": "./babel_output",   // Babel 출력 디렉토리
  "swcOutputDir": "./swc_output"        // SWC 출력 디렉토리
};
```

## 예상 결과

일반적으로 다음과 같은 성능 차이를 확인할 수 있습니다:

- **속도**: SWC가 Babel보다 3-10배 빠름
- **메모리**: SWC가 더 적은 메모리 사용 및 안정적인 패턴
- **GC 영향**: Babel은 JavaScript 기반으로 GC 영향을 받지만, SWC는 Native 코드로 일정한 성능
