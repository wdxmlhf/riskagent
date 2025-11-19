export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  roles: string[];
}

class MockAuth {
  private ticket: string | null = null;
  private userInfo: UserInfo | null = null;

  gotoLogin({ returnUrl }: { returnUrl: string }) {
    console.log('Mock login redirect:', returnUrl);
    const mockTicket = 'mock-ticket-' + Date.now();
    const url = new URL(returnUrl);
    url.searchParams.set('ticket', mockTicket);
    window.location.href = url.toString();
  }

  setTicket(ticket: string) {
    this.ticket = ticket;
    console.log('Mock ticket set:', ticket);
  }

  getTicket(): string | null {
    return this.ticket;
  }

  async getCurrentUserInfo(): Promise<UserInfo> {
    this.userInfo = {
      id: 'mock-user-1',
      name: 'Mock User',
      email: 'mock@example.com',
      roles: ['admin', 'user']
    };
    return this.userInfo;
  }

  checkAuth({ allowAnonymous, allowRoles }: { allowAnonymous: boolean; allowRoles?: string[] }): boolean {
    if (allowAnonymous) return true;
    if (!this.userInfo) return false;
    if (!allowRoles || allowRoles.length === 0) return true;
    return this.userInfo.roles.some(role => allowRoles.includes(role));
  }
}

class MockRepository<T> {
  private data: (T & { id: string })[] = [];

  async create(entity: T): Promise<T & { id: string }> {
    const newEntity = { ...entity, id: 'mock-id-' + Date.now() };
    this.data.push(newEntity);
    return newEntity;
  }

  async findOne({ where }: { where: any }): Promise<(T & { id: string }) | null> {
    const result = this.data.find(item => {
      return Object.keys(where).every(key => (item as any)[key] === where[key]);
    });
    return result || null;
  }

  async findAll({ where }: { where: any }): Promise<(T & { id: string })[]> {
    return this.data.filter(item => {
      return Object.keys(where).every(key => {
        const condition = where[key];
        if (typeof condition === 'object' && Symbol.for('like') in condition) {
          const pattern = condition[Symbol.for('like')];
          return String((item as any)[key]).includes(pattern.replace('%', ''));
        }
        return (item as any)[key] === condition;
      });
    });
  }

  async delete({ where }: { where: any }): Promise<number> {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => {
      return !Object.keys(where).every(key => (item as any)[key] === where[key]);
    });
    return initialLength - this.data.length;
  }
}

class MockDB {
  private repositories: Map<string, MockRepository<any>> = new Map();

  getRepository<T>(entityName: string): MockRepository<T> {
    if (!this.repositories.has(entityName)) {
      this.repositories.set(entityName, new MockRepository<T>());
    }
    return this.repositories.get(entityName)!;
  }
}

class MockAPI {
  async doRequest<T>(path: string, options: any): Promise<T> {
    console.log('Mock API request:', path, options);
    return { message: 'Mock response from ' + path } as T;
  }
}

class MockAMBase {
  auth: MockAuth;
  db: MockDB;
  api: MockAPI;

  constructor(config: any) {
    console.log('Mock AMBase initialized with config:', config);
    this.auth = new MockAuth();
    this.db = new MockDB();
    this.api = new MockAPI();
  }
}

const amTaskId = 3863;
const amEnv = 'prod';

const amHost = amEnv === 'prod' ? 'automate.corp.kuaishou.com' : 'automate.staging.kuaishou.com';

console.debug(`buildmode: ${BuildMode}`);

const config = {
  env: amEnv as 'prod' | 'staging',
  webappId: amTaskId,
  amTaskUrl: `https://${amHost}/res/task/run?taskId=${amTaskId}`,
  amWebAppUrl: `https://${amHost}/webapp/${amTaskId}`,
};

if (BuildMode === 'development') {
  config.amTaskUrl += '&debug=true';
  config.amWebAppUrl += '?debug=true';
}

export const ambase = new MockAMBase(config);

export const gotoLoginWithSSO = () => {
  let url = window.location.href;
  if (window.location.hash === '') {
    url += '#/';
  }
  ambase.auth.gotoLogin({ returnUrl: url });
};

export type Role = 'admin' | 'user' | 'superadmin';
