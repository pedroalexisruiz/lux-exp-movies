export const customFetch = async (input: RequestInfo, init: RequestInit = {}) => {
  const headers = new Headers(init?.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('Content-Type', 'application/json');

  const customOptions = {
    method: 'GET',
    ...init,
    headers: {
      ...Object.fromEntries(headers.entries()),
    },
  };
  const response = await fetch(input, customOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return parseResponse(response);
};

const parseResponse = async (response: Response) => {
  const data = await response.json();
  return data;
};
