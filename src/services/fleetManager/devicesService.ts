import { post, getToken } from '../apiService';
import environment from '../../environments/environment';

export async function getDeviceList(
  lonestarId: string,
  page: number,
  limit: number,
  requestBody: any = {}
): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  return await post(`${environment.baseAPI}lonestar/fleet/${lonestarId}/devices?${queryParams}`, requestBody, token);
}
