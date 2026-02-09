import { deleteRequest, get, getToken, post, put } from '../apiService';
import environment from '../../environments/environment';

export async function getDriverList(page: number, limit: number, requestBody: any = {}): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const url = `${environment.baseAPI}lonestar/drivers?${queryParams}`;

  return await post(url, requestBody, token);
}
