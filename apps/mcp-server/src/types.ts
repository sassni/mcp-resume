export type ExperienceItem = {
  company: string;
  title: string;
  start?: string;
  end?: string;
  bullets?: string[];
};

export type StructuredResume = {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills?: string[];
  experience: ExperienceItem[];
  education?: Array<{ school: string; degree?: string; start?: string; end?: string }>;
  rawText?: string;
};

export type AskCvArgs = { question: string };
export type SendEmailArgs = { to: string; subject: string; body: string };

export type JsonRpcRequest = {
  jsonrpc: '2.0';
  id?: number | string;
  method: string;
  params?: any;
};

export type JsonRpcResponse = {
  jsonrpc: '2.0';
  id?: number | string;
  result?: any;
  error?: { code: number; message: string; data?: any };
};
