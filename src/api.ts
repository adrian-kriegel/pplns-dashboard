  
export type GetResponse<T> = { results: T[], total: number };
  
export type TableResult<T> = 
  {
    rows: T[];
    total: number;
  } | GetResponse<T>;
  
  interface IAPIError
  {
    msg: string;
    code: number;
    data: unknown;
  }
  
/** General API Error */
export class APIError extends Error
{
    code: number;
    data: unknown;
    msg: string;
  
    /**
     * Creates new api error
     * @param method method
     * @param loc location
     * @param param2 { msg, data code }
     */
    constructor(
      method : string,
      loc : string,
      { msg, data, code } : IAPIError
    )
    {
      super(
        `${code} in ${method} ${loc}, Message: "${msg}"` +
        `, Data: ${JSON.stringify(data)}`
      );
  
      this.code = code;
      this.data = data;
      this.msg = msg;
    }
}
  
/**
   * 
   * @param method method
   * @param loc location
   * @param body body
   * @param headers optional headers
   * @param validationErrorMap error map for modform
   * @returns Promise<ReturnType>
   */
export async function request<ReturnType = unknown>(
  method: string,
  loc: string,
  body?: object,
  headers?: object,
) : Promise<ReturnType>
{
  // TODO: this should be RequestInit
  const params : any = { credentials: 'include', method };
  
  if (body)
  {
    params.body = JSON.stringify(body);
    params.headers = { 'Content-Type': 'application/json' };
  }
  
  if (headers) 
  {
    params.headers = { ...params.headers, ...headers};
  }
  let response; 
  
  try 
  {
    response = await fetch(
      new URL(loc, process.env.API_URL).href, 
      params
    );
  
  }
  catch (error) 
  {
    console.error(error);   
  }
  
  const isJSON = response?.headers
    .get('Content-Type')
    ?.includes('application/json');
  
  if (!response)
  {
    throw new Error('undefined response');
  }
  else if (
    (response.status >= 200 &&
      response.status < 300) ||
      response.status === 304 
  )
  {
    if (isJSON)
    {
      return await response.json();
    }
    else 
    {
      return await response.text() as any;
    }
      
  }
  else
  {
    if (!isJSON)
    {
      throw new Error('Non-Api Error: ' + await response.text());
    }
  
    const error = await response.json();
      
    throw new APIError(method, loc, error);
  }
}
  
/**
   * 
   * @param loc location
   * @param body body
   * @param headers headers
   * @returns Promise<ReturnType>
   */
export function post<ReturnType=unknown>(
  loc : string,
  body : object = {}, 
  headers?: object
)
{
  return request<ReturnType>('POST', loc, body, headers);
}
  
/**
   * 
   * @param loc location
   * @param body body
   * @param headers optional headers
   * @returns Promise<void>
   */
export function put<T = unknown>(
  loc : string,
  body : object = {}, 
  headers?: object,
)
{
  return request<T>('PUT', loc, body, headers);
}
  
  
/**
   * 
   * @param loc location
   * @param body body
   * @param component component
   * @returns Promise<void>
   */
export function patch<T = unknown>(
  loc : string,
  body : object = {},
)
{
  return request<T>('PATCH', loc, body);
}
  
/**
   * 
   * @param loc location
   * @param query query 
   * @param headers optional headers
   * @returns Promise<ReturnType>
   */
export function get<ReturnType=unknown>(
  loc : string, 
  query : object = {}, 
  headers?: object
)
{
  const searchParams = encodeQuery(query);
  
  return request<ReturnType>(
    'GET',
    loc + '?' + searchParams,
    undefined,
    headers
  );
}
  
  
/**
   * 
   * @param loc location
   * @param query query 
   * @returns Promise<ReturnType>
   */
export function del<ReturnType=unknown>(loc : string, query : object = {})
{
  const searchParams = encodeQuery(query);
   
  return request<ReturnType>(
    'DELETE',
    loc + '?' + searchParams,
  );
}
   
  
/**
   * 
   * @param query query object
   * @returns URLSearchParams
   */
export function encodeQuery(query : object)
{
  const searchParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(query))
  {
    searchParams.append(
      key,
      typeof value === 'object' ? 
        JSON.stringify(value) :
        value
    );
  }
  
  return searchParams;
}
  
/**
   * 
   * @param url url
   * @param params path params
   * @returns url with params filled in
   */
export function resource(
  url : string,
  params : { [k: string]: string | number }
)
{
  const vars = url.matchAll(/:[aA1-zZ9_]*/g, );
    
  for (const [v] of vars)
  {
    const key = v.substring(1);
  
    if (!(key in params))
    {
      throw new TypeError(`Key ${v} is missing in parameters`);
    } 
  
    url = url.replace(v, encodeURIComponent(params[key]));
  }
  
  return url;
}
  
