/**
 * Utility function để tạo slug từ tiếng Việt
 * Hỗ trợ bỏ dấu, chuyển đổi ký tự đặc biệt
 */
export function generateSlug(title: string): string {
  if (!title) return ""
  
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-") // Thay ký tự đặc biệt bằng dấu gạch ngang
    .replace(/^-+|-+$/g, "") // Bỏ dấu gạch ngang ở đầu và cuối
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
}

/**
 * Ensure slug is unique by appending number if needed
 * (Sẽ được sử dụng khi tích hợp database)
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  checkUnique: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = baseSlug
  let counter = 1
  
  while (!(await checkUnique(slug))) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  return slug
}
