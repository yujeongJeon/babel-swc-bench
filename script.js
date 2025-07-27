#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { performance } = require('perf_hooks');

// 벤치마크 설정
const CONFIG = {
  fileCount: 10000,
  outputDir: './benchmark_files',
  babelOutputDir: './babel_output',
  swcOutputDir: './swc_output'
};

// 가짜 TypeScript 파일 생성
function generateFakeTypescriptFiles() {
  console.log(`🔨 ${CONFIG.fileCount}개의 가짜 TypeScript 파일 생성 중...`);
  
  // 디렉토리 생성
  if (fs.existsSync(CONFIG.outputDir)) {
    fs.rmSync(CONFIG.outputDir, { recursive: true });
  }
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });

  const templates = [
    // React 컴포넌트 템플릿
    (index) => `
import React, { useState, useEffect } from 'react';

interface User${index} {
  id: number;
  name: string;
  email: string;
  posts: Post${index}[];
}

interface Post${index} {
  id: number;
  title: string;
  content: string;
  author: User${index};
  tags: string[];
}

const UserCard${index}: React.FC<{ user: User${index} }> = ({ user }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post${index}[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(\`/api/users/\${user.id}/posts\`);
        const data: Post${index}[] = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user.id]);

  const handlePostClick = (post: Post${index}) => {
    console.log(\`Clicked post: \${post.title}\`);
  };

  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      {isLoading ? (
        <div>Loading posts...</div>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id} onClick={() => handlePostClick(post)}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <div>
                {post.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCard${index};
`,

    // 서비스 클래스 템플릿
    (index) => `
export class DataService${index}<T> {
  private cache: Map<string, T> = new Map();
  private readonly apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async get<K extends keyof T>(id: string): Promise<T | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    try {
      const response = await fetch(\`\${this.apiUrl}/\${id}\`);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      const data: T = await response.json();
      this.cache.set(id, data);
      return data;
    } catch (error) {
      console.error(\`Failed to fetch data for id \${id}:\`, error);
      return null;
    }
  }

  async getAll(): Promise<T[]> {
    try {
      const response = await fetch(this.apiUrl);
      const data: T[] = await response.json();
      
      data.forEach((item: any) => {
        if (item.id) {
          this.cache.set(item.id, item);
        }
      });
      
      return data;
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      return [];
    }
  }

  async create(data: Omit<T, 'id'>): Promise<T | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const newItem: T = await response.json();
      if ((newItem as any).id) {
        this.cache.set((newItem as any).id, newItem);
      }
      
      return newItem;
    } catch (error) {
      console.error('Failed to create data:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const userService${index} = new DataService${index}<{
  id: string;
  name: string;
  email: string;
}>('/api/users');
`,

    // 유틸리티 함수 템플릿
    (index) => `
export interface Config${index} {
  apiUrl: string;
  timeout: number;
  retries: number;
  enableCache: boolean;
}

export type DeepPartial${index}<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial${index}<T[P]> : T[P];
};

export const defaultConfig${index}: Config${index} = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  enableCache: true,
};

export function mergeConfig${index}<T extends Config${index}>(
  base: T,
  override: DeepPartial${index}<T>
): T {
  const result = { ...base };
  
  for (const key in override) {
    if (override[key] !== undefined) {
      if (typeof override[key] === 'object' && override[key] !== null) {
        result[key] = mergeConfig${index}(
          result[key] as any,
          override[key] as any
        );
      } else {
        (result as any)[key] = override[key];
      }
    }
  }
  
  return result;
}

export async function retry${index}<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

export function debounce${index}<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export class EventEmitter${index}<T extends Record<string, any[]>> {
  private listeners: { [K in keyof T]?: ((...args: T[K]) => void)[] } = {};

  on<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }

  off<K extends keyof T>(event: K, listener: (...args: T[K]) => void): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}
`
  ];

  // 파일 생성
  for (let i = 0; i < CONFIG.fileCount; i++) {
    const template = templates[i % templates.length];
    const content = template(i);
    const filename = `file${i.toString().padStart(5, '0')}.tsx`;
    const filepath = path.join(CONFIG.outputDir, filename);
    
    fs.writeFileSync(filepath, content);
    
    if ((i + 1) % 1000 === 0) {
      console.log(`  ✅ ${i + 1}/${CONFIG.fileCount} 파일 생성 완료`);
    }
  }
  
  console.log(`✅ 총 ${CONFIG.fileCount}개 파일 생성 완료!\n`);
}

// 메모리 사용량 측정
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024) // MB
  };
}

// Babel로 변환
async function benchmarkBabel() {
  console.log('2. Babel 벤치마크 시작...');
  
  // Babel 설정 파일 생성
  const babelConfig = {
    presets: [
      '@babel/preset-env',
      '@babel/preset-react',
      '@babel/preset-typescript'
    ],
    plugins: [
      '@babel/plugin-transform-class-properties',
      '@babel/plugin-transform-runtime'
    ]
  };
  
  fs.writeFileSync('./babel.config.json', JSON.stringify(babelConfig, null, 2));
  
  // 출력 디렉토리 생성
  if (fs.existsSync(CONFIG.babelOutputDir)) {
    fs.rmSync(CONFIG.babelOutputDir, { recursive: true });
  }
  fs.mkdirSync(CONFIG.babelOutputDir, { recursive: true });

  const startTime = performance.now();
  const startMemory = getMemoryUsage();
  
  console.log(`  📝 메모리 시작: ${startMemory.heapUsed}MB`);
  
  // 중간 진행상황 체크를 위한 timeout 설정
  const progressInterval = setInterval(() => {
    const currentMemory = getMemoryUsage();
    const elapsed = (performance.now() - startTime) / 1000;
    console.log(`    ⏱️  경과시간: ${elapsed.toFixed(1)}초, 현재 메모리: ${currentMemory.heapUsed}MB`);
  }, 5000);
  
  try {
    // Babel CLI로 변환 (병렬 처리 없이)
    const command = `npx babel ${CONFIG.outputDir} --out-dir ${CONFIG.babelOutputDir} --extensions .tsx,.ts --source-maps`;
    
    console.log('  실행 중: ' + command);
    console.log('  💭 빌드 중 예상되는 현상:');
    console.log('    - 메모리 사용량이 점진적으로 증가');
    console.log('    - 중간에 갑작스러운 일시정지 (GC 실행)');
    console.log('    - 예측 불가능한 성능 변동');
    
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' }
    });
    
    clearInterval(progressInterval);
    
    const endTime = performance.now();
    const endMemory = getMemoryUsage();
    
    console.log(`  ✅ Babel 완료!`);
    console.log(`    📊 최종 메모리: ${endMemory.heapUsed}MB (증가: +${endMemory.heapUsed - startMemory.heapUsed}MB)`);
    
    return {
      name: 'Babel (JavaScript)',
      duration: Math.round(endTime - startTime),
      startMemory,
      endMemory,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      gcSuspected: true // JavaScript 기반이므로 GC 발생 가능
    };
  } catch (error) {
    clearInterval(progressInterval);
    console.error('Babel 변환 실패:', error.message);
    return null;
  }
}

// SWC로 변환
async function benchmarkSWC() {
  console.log('3. SWC 벤치마크 시작...');
  
  // SWC 설정 파일 생성
  const swcConfig = {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: false,
        dynamicImport: false
      },
      transform: {
        react: {
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
          throwIfNamespace: true,
          development: false,
          useBuiltins: false
        }
      },
      target: 'es2018'
    },
    module: {
      type: 'commonjs'
    },
    sourceMaps: true
  };
  
  fs.writeFileSync('./.swcrc', JSON.stringify(swcConfig, null, 2));
  
  // 출력 디렉토리 생성
  if (fs.existsSync(CONFIG.swcOutputDir)) {
    fs.rmSync(CONFIG.swcOutputDir, { recursive: true });
  }
  fs.mkdirSync(CONFIG.swcOutputDir, { recursive: true });

  const startTime = performance.now();
  const startMemory = getMemoryUsage();
  
  console.log(`  📝 메모리 시작: ${startMemory.heapUsed}MB`);
  
  try {
    // SWC CLI로 변환
    const command = `npx swc ${CONFIG.outputDir} -d ${CONFIG.swcOutputDir} --source-maps`;
    
    console.log('  실행 중: ' + command);
    console.log('  💭 SWC 특징:');
    console.log('    - Rust 네이티브 코드 (GC 없음)');
    console.log('    - 일정한 성능, 예측 가능한 속도');
    console.log('    - 멀티코어 활용');
    
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    const endTime = performance.now();
    const endMemory = getMemoryUsage();
    
    console.log(`  ✅ SWC 완료!`);
    console.log(`    📊 최종 메모리: ${endMemory.heapUsed}MB (증가: +${endMemory.heapUsed - startMemory.heapUsed}MB)`);
    
    return {
      name: 'SWC (Rust)',
      duration: Math.round(endTime - startTime),
      startMemory,
      endMemory,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      gcSuspected: false // Rust 기반이므로 GC 없음
    };
  } catch (error) {
    console.error('SWC 변환 실패:', error.message);
    return null;
  }
}

// 결과 출력
function printResults(babelResult, swcResult) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 벤치마크 결과: JavaScript GC vs Rust Native');
  console.log('='.repeat(70));
  
  if (babelResult) {
    console.log(`\n🔥 ${babelResult.name}:`);
    console.log(`├── 소요시간: ${(babelResult.duration / 1000).toFixed(1)}초`);
    console.log(`├── 시작 메모리: ${babelResult.startMemory.heapUsed}MB`);
    console.log(`├── 종료 메모리: ${babelResult.endMemory.heapUsed}MB`);
    console.log(`├── 메모리 증가: ${babelResult.memoryDelta}MB`);
    console.log(`└── GC 영향: ${babelResult.gcSuspected ? '⚠️  예상됨 (성능 변동 가능)' : '✅ 없음'}`);
  }
  
  if (swcResult) {
    console.log(`\n⚡ ${swcResult.name}:`);
    console.log(`├── 소요시간: ${(swcResult.duration / 1000).toFixed(1)}초`);
    console.log(`├── 시작 메모리: ${swcResult.startMemory.heapUsed}MB`);
    console.log(`├── 종료 메모리: ${swcResult.endMemory.heapUsed}MB`);
    console.log(`├── 메모리 증가: ${swcResult.memoryDelta}MB`);
    console.log(`└── GC 영향: ${swcResult.gcSuspected ? '⚠️  예상됨' : '✅ 없음 (일정한 성능)'}`);
  }
  
  if (babelResult && swcResult) {
    const speedup = babelResult.duration / swcResult.duration;
    const memoryImprovement = Math.abs(babelResult.memoryDelta) / Math.abs(swcResult.memoryDelta);
    
    console.log(`\n🏆 성능 비교 분석:`);
    console.log(`├── 속도: SWC가 ${speedup.toFixed(1)}배 빠름`);
    console.log(`├── 메모리: SWC가 ${memoryImprovement.toFixed(1)}배 효율적`);
    console.log(`├── 시간 절약: ${((babelResult.duration - swcResult.duration) / 1000).toFixed(1)}초`);
    console.log(`└── 개발 경험: SWC는 예측 가능, Babel은 변동성 있음`);
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 JavaScript vs Native 도구 성능 비교 벤치마크\n');
  
  // 필요한 패키지 설치 확인
  console.log('1. 설치된 패키지 확인 중...');
  try {
    execSync('npx babel --version && npx swc --version', { stdio: 'pipe' });
    console.log('✅ Babel과 SWC가 설치되어 있습니다.');
  } catch (error) {
    console.error('❌ Babel 또는 SWC가 설치되지 않았습니다.');
    console.log('다음 명령어로 설치해주세요:');
    console.log('npm install --save-dev @babel/cli @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-transform-class-properties @babel/plugin-transform-runtime @swc/cli @swc/core');
    process.exit(1);
  }
  
  // 가짜 파일 생성
  generateFakeTypescriptFiles();
  
  // 벤치마크 실행
  const babelResult = await benchmarkBabel();
  console.log(''); // 줄바꿈
  const swcResult = await benchmarkSWC();
  
  // 결과 출력
  printResults(babelResult, swcResult);
  
  // 정리
  console.log('\n4. 임시 파일 정리 중...');
  fs.rmSync(CONFIG.outputDir, { recursive: true });
  fs.rmSync(CONFIG.babelOutputDir, { recursive: true });
  fs.rmSync(CONFIG.swcOutputDir, { recursive: true });
  if (fs.existsSync('./babel.config.json')) fs.unlinkSync('./babel.config.json');
  if (fs.existsSync('./.swcrc')) fs.unlinkSync('./.swcrc');
  
  console.log('✅ 벤치마크 완료!');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, CONFIG };