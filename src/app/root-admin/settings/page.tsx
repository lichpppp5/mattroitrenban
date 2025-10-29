"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Settings, Palette, Globe, Mail, Shield, Upload, Image as ImageIcon, X } from "lucide-react"

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // General
    siteName: "Mặt Trời Trên Bản",
    siteUrl: "https://mattroitrenban.vn",
    siteDescription: "Tổ chức thiện nguyện Mặt Trời Trên Bản",
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    
    // Appearance
    primaryColor: "#F4A261",
    secondaryColor: "#2A9D8F",
    logoUrl: "",
    bannerUrl: "",
    faviconUrl: "",
    
    // Email
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@mattroitrenban.vn",
    fromName: "Mặt Trời Trên Bản",
    
    // Security
    enableRegistration: false,
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: "24",
    
    // Analytics
    googleAnalyticsId: "",
    facebookPixelId: "",
    
    // Social Media
    facebookUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    twitterUrl: "",
    
    // Floating Contact Menu
    floatingMenuEnabled: true,
    floatingMenuPhone: "+84 123 456 789",
    floatingMenuMessenger: "https://m.me/mattroitrenban",
    floatingMenuEmail: "info@mattroitrenban.vn",
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null)

  // Fetch settings from API on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/content")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      
      // Update settings from database
      setSettings(prev => ({
        ...prev,
        siteName: data["site.name"] || prev.siteName,
        siteUrl: data["site.url"] || prev.siteUrl,
        siteDescription: data["site.description"] || prev.siteDescription,
        primaryColor: data["site.primaryColor"] || prev.primaryColor,
        secondaryColor: data["site.secondaryColor"] || prev.secondaryColor,
        logoUrl: data["site.logo"] || prev.logoUrl,
        bannerUrl: data["site.banner"] || prev.bannerUrl,
        faviconUrl: data["site.favicon"] || prev.faviconUrl,
        facebookUrl: data["site.social.facebook"] || prev.facebookUrl,
        instagramUrl: data["site.social.instagram"] || prev.instagramUrl,
        youtubeUrl: data["site.social.youtube"] || prev.youtubeUrl,
        twitterUrl: data["site.social.twitter"] || prev.twitterUrl,
        floatingMenuEnabled: data["site.floatingMenu.enabled"] !== undefined 
          ? data["site.floatingMenu.enabled"] 
          : prev.floatingMenuEnabled,
        floatingMenuPhone: data["site.floatingMenu.phone"] || prev.floatingMenuPhone,
        floatingMenuMessenger: data["site.floatingMenu.messenger"] || prev.floatingMenuMessenger,
        floatingMenuEmail: data["site.floatingMenu.email"] || prev.floatingMenuEmail,
      }))
    } catch (err: any) {
      console.error("Error fetching settings:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveStatus(null)
      
      // Save all settings to API
      const savePromises = [
        // General
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.name", value: settings.siteName, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.url", value: settings.siteUrl, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.description", value: settings.siteDescription, type: "text" }),
        }),
        
        // Appearance
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.primaryColor", value: settings.primaryColor, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.secondaryColor", value: settings.secondaryColor, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.logo", value: settings.logoUrl, type: "image" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.banner", value: settings.bannerUrl, type: "image" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.favicon", value: settings.faviconUrl, type: "text" }),
        }),
        
        // Social Media
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.social.facebook", value: settings.facebookUrl, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.social.instagram", value: settings.instagramUrl, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.social.youtube", value: settings.youtubeUrl, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.social.twitter", value: settings.twitterUrl, type: "text" }),
        }),
        
        // Floating Menu
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            key: "site.floatingMenu.enabled", 
            value: String(settings.floatingMenuEnabled), 
            type: "text" 
          }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.floatingMenu.phone", value: settings.floatingMenuPhone, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.floatingMenu.messenger", value: settings.floatingMenuMessenger, type: "text" }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site.floatingMenu.email", value: settings.floatingMenuEmail, type: "text" }),
        }),
      ]
      
      await Promise.all(savePromises)
      
      setSaveStatus("success")
      setTimeout(() => setSaveStatus(null), 3000)
      
      // Refresh settings to confirm save
      await fetchSettings()
    } catch (err: any) {
      console.error("Error saving settings:", err)
      setSaveStatus("error")
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Cài đặt Website</h2>
          <p className="text-gray-600">Cấu hình các thông số của website</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
        </Button>
      </div>
      
      {/* Save Status */}
      {saveStatus === "success" && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✅ Đã lưu cài đặt thành công!
        </div>
      )}
      {saveStatus === "error" && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ Lỗi khi lưu cài đặt. Vui lòng thử lại.
        </div>
      )}
      
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Đang tải cài đặt...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Tên website</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="siteUrl">URL website</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="siteDescription">Mô tả website</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Múi giờ</Label>
                <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              Giao diện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Màu chủ đạo</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondaryColor">Màu phụ</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                />
              </div>
            </div>
            {/* Logo Upload */}
            <div>
              <Label>Logo</Label>
              <div className="mt-2">
                {settings.logoUrl ? (
                  <div className="relative inline-block">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo" 
                      className="h-20 w-auto border rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                      onClick={async () => {
                        setSettings({...settings, logoUrl: ""})
                        // Also delete from database
                        try {
                          await fetch("/api/content", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                              key: "site.logo", 
                              value: "", 
                              type: "image" 
                            }),
                          })
                        } catch (err) {
                          console.error("Error deleting logo:", err)
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Chưa có logo</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            // Check file size (max 5MB)
                            if (file.size > 5 * 1024 * 1024) {
                              alert("File quá lớn! Vui lòng chọn file nhỏ hơn 5MB")
                              return
                            }
                            
                            // For now, convert to base64 for storage
                            // In production, upload to Cloudinary first
                            const reader = new FileReader()
                            reader.onloadend = async () => {
                              const base64Url = reader.result as string
                              setSettings({...settings, logoUrl: base64Url})
                              
                              // Auto-save to database
                              try {
                                await fetch("/api/content", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ 
                                    key: "site.logo", 
                                    value: base64Url, 
                                    type: "image" 
                                  }),
                                })
                                setSaveStatus("success")
                                setTimeout(() => setSaveStatus(null), 2000)
                              } catch (err) {
                                console.error("Error auto-saving logo:", err)
                              }
                            }
                            reader.onerror = () => {
                              alert("Lỗi khi đọc file. Vui lòng thử lại.")
                            }
                            reader.readAsDataURL(file)
                          } catch (err) {
                            alert("Lỗi khi upload logo. Vui lòng thử lại.")
                            console.error("Upload error:", err)
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                )}
              </div>
              <Input
                id="logoUrl"
                value={settings.logoUrl}
                onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                placeholder="Hoặc nhập URL logo..."
                className="mt-2"
              />
            </div>

            {/* Banner Upload */}
            <div>
              <Label>Ảnh Banner (Hero)</Label>
              <div className="mt-2">
                {settings.bannerUrl ? (
                  <div className="relative">
                    <img 
                      src={settings.bannerUrl} 
                      alt="Banner" 
                      className="w-full h-48 object-cover border rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                      onClick={async () => {
                        setSettings({...settings, bannerUrl: ""})
                        // Also delete from database
                        try {
                          await fetch("/api/content", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                              key: "site.banner", 
                              value: "", 
                              type: "image" 
                            }),
                          })
                        } catch (err) {
                          console.error("Error deleting banner:", err)
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">Chưa có banner</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="banner-upload"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            // Check file size (max 10MB for banner)
                            if (file.size > 10 * 1024 * 1024) {
                              alert("File quá lớn! Vui lòng chọn file nhỏ hơn 10MB")
                              return
                            }
                            
                            // For now, convert to base64 for storage
                            // In production, upload to Cloudinary first
                            const reader = new FileReader()
                            reader.onloadend = async () => {
                              const base64Url = reader.result as string
                              setSettings({...settings, bannerUrl: base64Url})
                              
                              // Auto-save to database
                              try {
                                await fetch("/api/content", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ 
                                    key: "site.banner", 
                                    value: base64Url, 
                                    type: "image" 
                                  }),
                                })
                                setSaveStatus("success")
                                setTimeout(() => setSaveStatus(null), 2000)
                              } catch (err) {
                                console.error("Error auto-saving banner:", err)
                              }
                            }
                            reader.onerror = () => {
                              alert("Lỗi khi đọc file. Vui lòng thử lại.")
                            }
                            reader.readAsDataURL(file)
                          } catch (err) {
                            alert("Lỗi khi upload banner. Vui lòng thử lại.")
                            console.error("Upload error:", err)
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('banner-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Banner
                    </Button>
                  </div>
                )}
              </div>
              <Input
                id="bannerUrl"
                value={settings.bannerUrl || ""}
                onChange={(e) => setSettings({...settings, bannerUrl: e.target.value})}
                placeholder="Hoặc nhập URL banner..."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="faviconUrl">URL Favicon</Label>
              <Input
                id="faviconUrl"
                value={settings.faviconUrl}
                onChange={(e) => setSettings({...settings, faviconUrl: e.target.value})}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Cấu hình Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="smtpUser">SMTP User</Label>
              <Input
                id="smtpUser"
                value={settings.smtpUser}
                onChange={(e) => setSettings({...settings, smtpUser: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromEmail">Email gửi</Label>
                <Input
                  id="fromEmail"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="fromName">Tên gửi</Label>
                <Input
                  id="fromName"
                  value={settings.fromName}
                  onChange={(e) => setSettings({...settings, fromName: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Bảo mật
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableRegistration">Cho phép đăng ký</Label>
                <p className="text-sm text-gray-500">Cho phép người dùng tự đăng ký tài khoản</p>
              </div>
              <Switch
                id="enableRegistration"
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => setSettings({...settings, enableRegistration: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEmailVerification">Yêu cầu xác thực email</Label>
                <p className="text-sm text-gray-500">Yêu cầu xác thực email khi đăng ký</p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableTwoFactor">Xác thực hai yếu tố</Label>
                <p className="text-sm text-gray-500">Bật xác thực hai yếu tố cho admin</p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => setSettings({...settings, enableTwoFactor: checked})}
              />
            </div>
            <div>
              <Label htmlFor="sessionTimeout">Thời gian hết hạn session (giờ)</Label>
              <Input
                id="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <Input
                id="googleAnalyticsId"
                value={settings.googleAnalyticsId}
                onChange={(e) => setSettings({...settings, googleAnalyticsId: e.target.value})}
                placeholder="GA-XXXXXXXXX-X"
              />
            </div>
            <div>
              <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
              <Input
                id="facebookPixelId"
                value={settings.facebookPixelId}
                onChange={(e) => setSettings({...settings, facebookPixelId: e.target.value})}
                placeholder="123456789012345"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Mạng xã hội
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                value={settings.facebookUrl}
                onChange={(e) => setSettings({...settings, facebookUrl: e.target.value})}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                value={settings.instagramUrl}
                onChange={(e) => setSettings({...settings, instagramUrl: e.target.value})}
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="youtubeUrl">YouTube URL</Label>
              <Input
                id="youtubeUrl"
                value={settings.youtubeUrl}
                onChange={(e) => setSettings({...settings, youtubeUrl: e.target.value})}
                placeholder="https://youtube.com/channel/yourchannel"
              />
            </div>
            <div>
              <Label htmlFor="twitterUrl">Twitter URL</Label>
              <Input
                id="twitterUrl"
                value={settings.twitterUrl}
                onChange={(e) => setSettings({...settings, twitterUrl: e.target.value})}
                placeholder="https://twitter.com/yourpage"
              />
            </div>
          </CardContent>
        </Card>

        {/* Floating Contact Menu Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Menu Liên hệ Nổi (Floating Menu)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="floatingMenuEnabled">Hiển thị menu liên hệ nổi</Label>
                <p className="text-sm text-gray-500">Menu nổi ở góc dưới bên phải website</p>
              </div>
              <Switch
                id="floatingMenuEnabled"
                checked={settings.floatingMenuEnabled}
                onCheckedChange={(checked) => setSettings({...settings, floatingMenuEnabled: checked})}
              />
            </div>
            <div>
              <Label htmlFor="floatingMenuPhone">Số điện thoại</Label>
              <Input
                id="floatingMenuPhone"
                value={settings.floatingMenuPhone}
                onChange={(e) => setSettings({...settings, floatingMenuPhone: e.target.value})}
                placeholder="+84 123 456 789"
              />
            </div>
            <div>
              <Label htmlFor="floatingMenuMessenger">Facebook Messenger URL</Label>
              <Input
                id="floatingMenuMessenger"
                value={settings.floatingMenuMessenger}
                onChange={(e) => setSettings({...settings, floatingMenuMessenger: e.target.value})}
                placeholder="https://m.me/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="floatingMenuEmail">Email</Label>
              <Input
                id="floatingMenuEmail"
                type="email"
                value={settings.floatingMenuEmail}
                onChange={(e) => setSettings({...settings, floatingMenuEmail: e.target.value})}
                placeholder="info@example.com"
              />
            </div>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}
