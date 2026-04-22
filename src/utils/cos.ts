/**
 * 腾讯云 COS 上传工具
 * 通过后端代理上传到腾讯云 COS 储存桶
 */

/**
 * 上传图片到腾讯云 COS（通过后端代理）
 * @param file 文件对象
 * @param onProgress 进度回调
 * @returns COS URL
 */
export async function uploadToCos(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', '/api/upload/image');

    xhr.upload.onprogress = function (event) {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    };

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.code === 200) {
            resolve(res.data.url);
          } else {
            reject(new Error(res.message || '上传失败'));
          }
        } catch {
          reject(new Error('解析响应失败'));
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          reject(new Error(res.message || `上传失败: ${xhr.status}`));
        } catch {
          reject(new Error(`上传失败: ${xhr.status}`));
        }
      }
    };

    xhr.onerror = function () {
      reject(new Error('网络错误，上传失败'));
    };

    xhr.onabort = function () {
      reject(new Error('上传已取消'));
    };

    xhr.send(formData);
  });
}
