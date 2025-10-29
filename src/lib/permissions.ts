// Helper function để kiểm tra quyền
export function hasPermission(userRole: string | undefined, requiredRole: "admin" | "editor" | "viewer") {
  if (!userRole) return false
  
  const roleHierarchy = {
    admin: 3,
    editor: 2,
    viewer: 1,
  }
  
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole]
}

export function canEditContent(userRole: string | undefined) {
  return hasPermission(userRole, "editor")
}

export function canManageUsers(userRole: string | undefined) {
  return hasPermission(userRole, "admin")
}

export function canManageSettings(userRole: string | undefined) {
  return hasPermission(userRole, "admin")
}
