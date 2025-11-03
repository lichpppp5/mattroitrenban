"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Heart, CreditCard, Smartphone, QrCode, CheckCircle, Users, DollarSign, Calendar, MapPin, Copy, Check, Building2, Wallet, AlertCircle, Loader2 } from "lucide-react"

interface Activity {
  id: string
  title: string
  slug: string
  location: string | null
  tripDate: string | null
  category: string | null
  imageUrl: string | null
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  icon: string | null
  accountNumber: string | null
  accountName: string | null
  bankName: string | null
  branch: string | null
  phone: string | null
  qrCode: string | null
  description: string | null
  instructions: string | null
}

interface RecentDonation {
  id: string
  name: string
  amount: number
  message: string | null
  isAnonymous: boolean
  createdAt: string
}

// Build transfer content without Vietnamese diacritics and with Title Case
const removeVietnameseTones = (input: string) => {
  if (!input) return ""
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

const toTitleCase = (input: string) => {
  return input
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
}

const buildTransferContent = (donorName: string, campaignTitle?: string | null) => {
  const donor = toTitleCase(removeVietnameseTones(donorName || ""))
  const campaign = campaignTitle ? toTitleCase(removeVietnameseTones(campaignTitle)) : null
  return campaign ? `${donor}-${campaign}` : donor
}

export default function Donate() {
  const [donationAmount, setDonationAmount] = useState("")
  const [donorName, setDonorName] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [activeCampaigns, setActiveCampaigns] = useState<Activity[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [donationSubmitted, setDonationSubmitted] = useState(false)
  const [submittedDonationData, setSubmittedDonationData] = useState<{
    donorName: string
    campaignTitle: string | null
    amount: number
  } | null>(null)
  const [donationStats, setDonationStats] = useState<{
    totalDonations: number
    donationCount: number
    peopleSupported: number
  }>({
    totalDonations: 0,
    donationCount: 0,
    peopleSupported: 0,
  })

  const quickAmounts = [50000, 100000, 200000, 500000, 1000000]

  useEffect(() => {
    // Fetch active/upcoming campaigns
    fetch("/api/activities?published=true&upcoming=true")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActiveCampaigns(data)
        }
      })
      .catch(err => console.error("Error fetching campaigns:", err))

    // Fetch payment methods
    fetch("/api/payment-methods")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPaymentMethods(data)
        }
      })
      .catch(err => console.error("Error fetching payment methods:", err))

    // Fetch recent donations
    fetch("/api/donations/public?limit=5")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRecentDonations(data)
        }
      })
      .catch(err => console.error("Error fetching recent donations:", err))

    // Fetch donation statistics
    fetch("/api/transparency")
      .then(res => res.json())
      .then(data => {
        if (data && data.summary) {
          // Calculate people supported (estimate: donation count or use stat from content)
          fetch("/api/content")
            .then(contentRes => contentRes.json())
            .then(contentData => {
              const peopleSupported = contentData.stat1Number || 
                Math.round(data.summary.donationCount * 0.48) // Estimate: ~48% of donations help someone
              
              setDonationStats({
                totalDonations: data.summary.totalDonations || 0,
                donationCount: data.summary.donationCount || 0,
                peopleSupported: typeof peopleSupported === 'string' 
                  ? parseInt(peopleSupported.replace(/[^\d]/g, '')) || 0
                  : peopleSupported || 0,
              })
            })
            .catch(err => {
              console.error("Error fetching content:", err)
              setDonationStats({
                totalDonations: data.summary.totalDonations || 0,
                donationCount: data.summary.donationCount || 0,
                peopleSupported: Math.round((data.summary.donationCount || 0) * 0.48),
              })
            })
        }
      })
      .catch(err => console.error("Error fetching transparency data:", err))
      .finally(() => setLoading(false))
  }, [])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(type)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Vừa xong"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`
    return date.toLocaleDateString("vi-VN")
  }

  const getPaymentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "bank":
      case "chuyển khoản":
        return <Building2 className="h-5 w-5" />
      case "momo":
      case "ví điện tử":
        return <Wallet className="h-5 w-5" />
      case "qrcode":
      case "qr code":
        return <QrCode className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ")
      return
    }

    if (!isAnonymous && !donorName.trim()) {
      alert("Vui lòng nhập tên hoặc chọn quyên góp ẩn danh")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/donations/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isAnonymous ? "" : donorName,
          amount: parseFloat(donationAmount),
          message: donorMessage,
          isPublic,
          isAnonymous,
          activityId: selectedCampaign || null, // Link với campaign nếu quyên góp cho campaign
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Không thể gửi quyên góp. Vui lòng thử lại sau.")
      }

      const result = await response.json()
      
      // Lấy tên chiến dịch nếu có
      const campaignTitle = selectedCampaignData?.title || null
      const displayName = isAnonymous ? "Người ủng hộ" : donorName.trim() || "Người ủng hộ"
      
      // Lưu thông tin donation đã submit để hiển thị payment info
      setSubmittedDonationData({
        donorName: displayName,
        campaignTitle,
        amount: parseFloat(donationAmount),
      })
      setDonationSubmitted(true)
      
      // Scroll to payment methods
      setTimeout(() => {
        const paymentSection = document.getElementById("payment-methods-section")
        if (paymentSection) {
          paymentSection.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 300)
      
      // Reset form (nhưng giữ lại selectedCampaign để hiển thị payment)
      setDonationAmount("")
      setDonorMessage("")
      // Không reset donorName và selectedCampaign vì cần dùng để hiển thị payment info

      // Refresh recent donations
      fetch("/api/donations/public?limit=5")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRecentDonations(data)
          }
        })
        .catch(err => console.error("Error fetching recent donations:", err))
    } catch (err: any) {
      console.error("Error submitting donation:", err)
      alert(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCampaignData = activeCampaigns.find(c => c.id === selectedCampaign)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 shadow-lg transform hover:scale-105 transition-transform">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-poppins">
              Quyên góp
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Mỗi đóng góp của bạn sẽ mang đến hy vọng và cơ hội cho những người cần giúp đỡ. 
              Cùng chúng tôi lan tỏa yêu thương đến những vùng cao xa xôi.
            </p>
          </div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="campaign" className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 bg-gray-100 p-1">
              <TabsTrigger 
                value="campaign" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => {
                  // Reset donation submitted khi chuyển tab
                  setDonationSubmitted(false)
                  setSubmittedDonationData(null)
                }}
              >
                Quyên góp cho chiến dịch đang diễn ra
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
                onClick={() => {
                  // Reset donation submitted khi chuyển tab
                  setDonationSubmitted(false)
                  setSubmittedDonationData(null)
                  setSelectedCampaign("") // Clear campaign selection for general donation
                }}
              >
                Quyên góp chung
              </TabsTrigger>
            </TabsList>

            {/* Campaign Donation Tab */}
            <TabsContent value="campaign" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
                {/* Left: Donation Form */}
                <div className="space-y-6">
                  <Card className="border-2 border-gray-100 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b">
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Quyên góp cho chiến dịch đang diễn ra
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {loading ? (
                        <div className="text-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
                          <p className="text-gray-500">Đang tải chiến dịch...</p>
                        </div>
                      ) : activeCampaigns.length > 0 ? (
                        <>
                          {/* Campaign Selection */}
                          <div>
                            <Label htmlFor="campaign" className="text-base font-semibold mb-3 block text-gray-700">
                              Chọn chiến dịch bạn muốn quyên góp
                            </Label>
                            <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                              <SelectTrigger id="campaign" className="h-12 text-base">
                                <SelectValue placeholder="Chọn chiến dịch..." />
                              </SelectTrigger>
                              <SelectContent>
                                {activeCampaigns.map((campaign) => (
                                  <SelectItem key={campaign.id} value={campaign.id}>
                                    <div className="flex flex-col py-1">
                                      <span className="font-semibold">{campaign.title}</span>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        {campaign.location && (
                                          <span className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {campaign.location}
                                          </span>
                                        )}
                                        {campaign.tripDate && (
                                          <span className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(campaign.tripDate).toLocaleDateString("vi-VN")}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Selected Campaign Info */}
                          {selectedCampaign && selectedCampaignData && (
                            <Card className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-200 shadow-md">
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <h3 className="font-bold text-lg text-teal-900">{selectedCampaignData.title}</h3>
                                  <div className="space-y-2">
                                    {selectedCampaignData.location && (
                                      <p className="text-sm text-teal-700 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2" />
                                        {selectedCampaignData.location}
                                      </p>
                                    )}
                                    {selectedCampaignData.tripDate && (
                                      <p className="text-sm text-teal-700 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(selectedCampaignData.tripDate).toLocaleDateString("vi-VN")}
                                      </p>
                                    )}
                                  </div>
                                  <Link 
                                    href={`/activities/${selectedCampaignData.slug}`}
                                    className="inline-flex items-center text-teal-600 hover:text-teal-700 text-sm font-semibold underline mt-2"
                                  >
                                    Xem chi tiết chiến dịch →
                                  </Link>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Donation Form */}
                          <form onSubmit={handleDonate} className="space-y-6">
                            {/* Amount */}
                            <div>
                              <Label htmlFor="campaign-amount" className="text-base font-semibold text-gray-700">
                                Số tiền quyên góp (VND) <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="campaign-amount"
                                type="number"
                                placeholder="Nhập số tiền..."
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                className="mt-2 text-lg h-12 font-semibold"
                                required
                                min="1000"
                                step="1000"
                              />
                              <div className="flex gap-2 mt-3 flex-wrap">
                                {quickAmounts.map((amount) => (
                                  <Button
                                    key={amount}
                                    type="button"
                                    variant={donationAmount === amount.toString() ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setDonationAmount(amount.toString())}
                                    className={`text-sm ${donationAmount === amount.toString() ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                                  >
                                    {amount.toLocaleString("vi-VN")}đ
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Donor Name */}
                            <div>
                              <Label htmlFor="campaign-name" className="text-base font-semibold text-gray-700">
                                Tên người quyên góp {!isAnonymous && <span className="text-red-500">*</span>}
                              </Label>
                              <Input
                                id="campaign-name"
                                type="text"
                                placeholder="Nhập tên của bạn..."
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="mt-2 h-11"
                                disabled={isAnonymous}
                                required={!isAnonymous}
                              />
                            </div>

                            {/* Message */}
                            <div>
                              <Label htmlFor="campaign-message" className="text-base font-semibold text-gray-700">
                                Lời nhắn (tùy chọn)
                              </Label>
                              <Textarea
                                id="campaign-message"
                                placeholder="Nhập lời nhắn của bạn..."
                                value={donorMessage}
                                onChange={(e) => setDonorMessage(e.target.value)}
                                className="mt-2 min-h-[100px]"
                                rows={4}
                              />
                            </div>

                            {/* Options */}
                            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id="campaign-anonymous"
                                  checked={isAnonymous}
                                  onCheckedChange={(checked) => {
                                    setIsAnonymous(checked as boolean)
                                    if (checked) {
                                      setDonorName("")
                                    }
                                  }}
                                />
                                <Label htmlFor="campaign-anonymous" className="text-sm font-medium cursor-pointer">
                                  Quyên góp ẩn danh
                                </Label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  id="campaign-public"
                                  checked={isPublic}
                                  onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                                />
                                <Label htmlFor="campaign-public" className="text-sm font-medium cursor-pointer">
                                  Hiển thị công khai trên website
                                </Label>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                              type="submit"
                              disabled={!selectedCampaign || !donationAmount || submitting || (!isAnonymous && !donorName.trim())}
                              className="w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                              onClick={(e) => {
                                // Reset donation submitted state khi submit lại
                                if (!donationSubmitted) {
                                  setDonationSubmitted(false)
                                  setSubmittedDonationData(null)
                                }
                              }}
                            >
                              {submitting ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Đang xử lý...
                                </>
                              ) : (
                                <>
                                  <Heart className="mr-2 h-5 w-5" />
                                  Quyên góp ngay
                                </>
                              )}
                            </Button>

                            {!selectedCampaign && (
                              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-yellow-800">
                                  Vui lòng chọn một chiến dịch để tiếp tục quyên góp
                                </p>
                              </div>
                            )}
                            
                            {donationSubmitted && submittedDonationData && (
                              <div className="flex items-start gap-2 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-green-800 mb-1">
                                    ✓ Yêu cầu quyên góp đã được gửi thành công!
                                  </p>
                                  <p className="text-xs text-green-700">
                                    Vui lòng thực hiện chuyển khoản theo thông tin phương thức thanh toán bên cạnh. 
                                    Đừng quên nhập đúng nội dung chuyển khoản khi thanh toán.
                                  </p>
                                </div>
                              </div>
                            )}
                          </form>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-6">Hiện chưa có chiến dịch đang diễn ra</p>
                          <Button asChild variant="outline" size="lg">
                            <Link href="/activities">Xem tất cả chiến dịch</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Payment Methods & Recent Donations */}
                <div className="space-y-6" id="payment-methods-section">
                  {/* Payment Methods */}
                  <Card className={`border-2 shadow-lg transition-all ${donationSubmitted ? 'border-green-400 bg-green-50/30' : 'border-gray-100'}`}>
                    <CardHeader className={`border-b ${donationSubmitted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Phương thức thanh toán
                        </CardTitle>
                        {donationSubmitted && submittedDonationData && (
                          <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                            <CheckCircle className="h-3 w-3" />
                            Đã gửi yêu cầu
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {/* Transaction Content Info (shown after submission) */}
                      {donationSubmitted && submittedDonationData && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg shadow-md">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-2 text-sm">Nội dung chuyển khoản:</h4>
                              <div className="bg-white p-3 rounded-md border border-orange-200">
                                <p className="font-mono text-base font-bold text-gray-900 break-all">
                                  {buildTransferContent(submittedDonationData.donorName, submittedDonationData.campaignTitle)}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 text-xs"
                                onClick={() => {
                                  const transferContent = buildTransferContent(
                                    submittedDonationData.donorName,
                                    submittedDonationData.campaignTitle
                                  )
                                  copyToClipboard(transferContent, "transfer-content")
                                }}
                              >
                                {copiedText === "transfer-content" ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1 text-green-600" />
                                    Đã sao chép
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Sao chép nội dung
                                  </>
                                )}
                              </Button>
                              <p className="text-xs text-gray-600 mt-2">
                                <strong>Lưu ý:</strong> Vui lòng nhập đúng nội dung chuyển khoản ở trên khi thực hiện thanh toán để chúng tôi có thể xác nhận quyên góp của bạn.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => {
                          // Generate transfer content for this method
                          const transferContent = donationSubmitted && submittedDonationData
                            ? buildTransferContent(
                                submittedDonationData.donorName,
                                submittedDonationData.campaignTitle
                              )
                            : null
                          
                          return (
                          <Card key={method.id} className={`border transition-all ${
                            donationSubmitted 
                              ? 'border-green-300 bg-green-50/50 hover:border-green-400 hover:shadow-lg' 
                              : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                          }`}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${
                                  method.type.toLowerCase().includes("bank") ? "bg-blue-100 text-blue-600" :
                                  method.type.toLowerCase().includes("momo") ? "bg-pink-100 text-pink-600" :
                                  "bg-purple-100 text-purple-600"
                                }`}>
                                  {getPaymentIcon(method.type)}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                  
                                  {method.accountNumber && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">STK:</span>
                                      <span className="text-sm font-mono font-semibold">{method.accountNumber}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(method.accountNumber!, `account-${method.id}`)}
                                      >
                                        {copiedText === `account-${method.id}` ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-gray-400" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {transferContent && donationSubmitted && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                      <p className="text-xs text-gray-600 mb-1 font-semibold">Nội dung chuyển khoản:</p>
                                      <p className="text-sm font-mono font-bold text-gray-900 break-all">{transferContent}</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 h-7 text-xs"
                                        onClick={() => copyToClipboard(transferContent, `transfer-${method.id}`)}
                                      >
                                        {copiedText === `transfer-${method.id}` ? (
                                          <>
                                            <Check className="h-3 w-3 mr-1 text-green-600" />
                                            Đã sao chép
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="h-3 w-3 mr-1" />
                                            Sao chép
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}

                                  {method.bankName && (
                                    <p className="text-sm text-gray-600">
                                      Ngân hàng: <span className="font-semibold">{method.bankName}</span>
                                    </p>
                                  )}

                                  {method.accountName && (
                                    <p className="text-sm text-gray-600">
                                      Chủ TK: <span className="font-semibold">{method.accountName}</span>
                                    </p>
                                  )}

                                  {method.phone && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">SĐT:</span>
                                      <span className="text-sm font-mono font-semibold">{method.phone}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(method.phone!, `phone-${method.id}`)}
                                      >
                                        {copiedText === `phone-${method.id}` ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-gray-400" />
                                        )}
                                      </Button>
                                    </div>
                                  )}

                                  {method.qrCode && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-sm text-gray-600 mb-2">Quét mã QR để thanh toán</p>
                                      <div className="relative w-32 h-32 bg-white p-2 rounded-lg border border-gray-200">
                                        {method.qrCode.startsWith("data:image") || method.qrCode.startsWith("http") ? (
                                          <Image
                                            src={method.qrCode}
                                            alt="QR Code"
                                            fill
                                            className="object-contain rounded"
                                            unoptimized
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                            <QrCode className="h-12 w-12 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {method.instructions && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <p className="text-xs text-gray-500 whitespace-pre-line">{method.instructions}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">Chưa có phương thức thanh toán nào</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Donations */}
                  {recentDonations.length > 0 && (
                    <Card className="border-2 border-gray-100 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                          Quyên góp gần đây
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {recentDonations.map((donation) => (
                            <div
                              key={donation.id}
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-200 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 truncate">
                                    {donation.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {formatTimeAgo(donation.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-green-600 text-sm flex-shrink-0 ml-2">
                                {donation.amount.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Link
                            href="/transparency"
                            className="text-sm text-green-600 hover:text-green-700 font-semibold text-center block"
                          >
                            Xem tất cả quyên góp →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* General Donation Tab */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8">
                {/* Left: Donation Form */}
                <div className="space-y-6">
                  <Card className="border-2 border-gray-100 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Quyên góp chung
                      </CardTitle>
                      <p className="text-gray-600 mt-2 text-sm">
                        Quyên góp của bạn sẽ được sử dụng cho các hoạt động thiện nguyện tổng quát của tổ chức
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      <form onSubmit={handleDonate} className="space-y-6">
                        {/* Amount */}
                        <div>
                          <Label htmlFor="general-amount" className="text-base font-semibold text-gray-700">
                            Số tiền quyên góp (VND) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="general-amount"
                            type="number"
                            placeholder="Nhập số tiền..."
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            className="mt-2 text-lg h-12 font-semibold"
                            required
                            min="1000"
                            step="1000"
                          />
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {quickAmounts.map((amount) => (
                              <Button
                                key={amount}
                                type="button"
                                variant={donationAmount === amount.toString() ? "default" : "outline"}
                                size="sm"
                                onClick={() => setDonationAmount(amount.toString())}
                                className={`text-sm ${donationAmount === amount.toString() ? "bg-orange-500 hover:bg-orange-600" : ""}`}
                              >
                                {amount.toLocaleString("vi-VN")}đ
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Donor Name */}
                        <div>
                          <Label htmlFor="general-name" className="text-base font-semibold text-gray-700">
                            Tên người quyên góp {!isAnonymous && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="general-name"
                            type="text"
                            placeholder="Nhập tên của bạn..."
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            className="mt-2 h-11"
                            disabled={isAnonymous}
                            required={!isAnonymous}
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <Label htmlFor="general-message" className="text-base font-semibold text-gray-700">
                            Lời nhắn (tùy chọn)
                          </Label>
                          <Textarea
                            id="general-message"
                            placeholder="Nhập lời nhắn của bạn..."
                            value={donorMessage}
                            onChange={(e) => setDonorMessage(e.target.value)}
                            className="mt-2 min-h-[100px]"
                            rows={4}
                          />
                        </div>

                        {/* Options */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="general-anonymous"
                              checked={isAnonymous}
                              onCheckedChange={(checked) => {
                                setIsAnonymous(checked as boolean)
                                if (checked) {
                                  setDonorName("")
                                }
                              }}
                            />
                            <Label htmlFor="general-anonymous" className="text-sm font-medium cursor-pointer">
                              Quyên góp ẩn danh
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id="general-public"
                              checked={isPublic}
                              onCheckedChange={(checked) => setIsPublic(checked as boolean)}
                            />
                            <Label htmlFor="general-public" className="text-sm font-medium cursor-pointer">
                              Hiển thị công khai trên website
                            </Label>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={!donationAmount || submitting || (!isAnonymous && !donorName.trim())}
                          className="w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
                          onClick={(e) => {
                            // Reset donation submitted state khi submit lại
                            if (!donationSubmitted) {
                              setDonationSubmitted(false)
                              setSubmittedDonationData(null)
                            }
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Heart className="mr-2 h-5 w-5" />
                              Quyên góp ngay
                            </>
                          )}
                        </Button>
                        
                        {donationSubmitted && submittedDonationData && (
                          <div className="flex items-start gap-2 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-green-800 mb-1">
                                ✓ Yêu cầu quyên góp đã được gửi thành công!
                              </p>
                              <p className="text-xs text-green-700">
                                Vui lòng thực hiện chuyển khoản theo thông tin phương thức thanh toán bên cạnh. 
                                Đừng quên nhập đúng nội dung chuyển khoản khi thanh toán.
                              </p>
                            </div>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Payment Methods & Recent Donations (same as campaign tab) */}
                <div className="space-y-6" id="payment-methods-section-general">
                  {/* Payment Methods */}
                  <Card className={`border-2 shadow-lg transition-all ${donationSubmitted ? 'border-green-400 bg-green-50/30' : 'border-gray-100'}`}>
                    <CardHeader className={`border-b ${donationSubmitted ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                          <CreditCard className="mr-2 h-5 w-5" />
                          Phương thức thanh toán
                        </CardTitle>
                        {donationSubmitted && submittedDonationData && (
                          <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                            <CheckCircle className="h-3 w-3" />
                            Đã gửi yêu cầu
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                      {/* Transaction Content Info (shown after submission) */}
                      {donationSubmitted && submittedDonationData && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg shadow-md">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-2 text-sm">Nội dung chuyển khoản:</h4>
                              <div className="bg-white p-3 rounded-md border border-orange-200">
                                <p className="font-mono text-base font-bold text-gray-900 break-all">
                                  {buildTransferContent(submittedDonationData.donorName, submittedDonationData.campaignTitle)}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 h-8 text-xs"
                                onClick={() => {
                                  const transferContent = submittedDonationData.campaignTitle
                                    ? `${submittedDonationData.donorName} - ${submittedDonationData.campaignTitle}`
                                    : submittedDonationData.donorName
                                  copyToClipboard(transferContent, "transfer-content-general")
                                }}
                              >
                                {copiedText === "transfer-content-general" ? (
                                  <>
                                    <Check className="h-3 w-3 mr-1 text-green-600" />
                                    Đã sao chép
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 mr-1" />
                                    Sao chép nội dung
                                  </>
                                )}
                              </Button>
                              <p className="text-xs text-gray-600 mt-2">
                                <strong>Lưu ý:</strong> Vui lòng nhập đúng nội dung chuyển khoản ở trên khi thực hiện thanh toán để chúng tôi có thể xác nhận quyên góp của bạn.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {paymentMethods.length > 0 ? (
                        paymentMethods.map((method) => {
                          // Generate transfer content for this method
                          const transferContent = donationSubmitted && submittedDonationData
                            ? buildTransferContent(
                                submittedDonationData.donorName,
                                submittedDonationData.campaignTitle
                              )
                            : null
                          
                          return (
                          <Card key={method.id} className={`border transition-all ${
                            donationSubmitted 
                              ? 'border-green-300 bg-green-50/50 hover:border-green-400 hover:shadow-lg' 
                              : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                          }`}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-lg ${
                                  method.type.toLowerCase().includes("bank") ? "bg-blue-100 text-blue-600" :
                                  method.type.toLowerCase().includes("momo") ? "bg-pink-100 text-pink-600" :
                                  "bg-purple-100 text-purple-600"
                                }`}>
                                  {getPaymentIcon(method.type)}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                  
                                  {method.accountNumber && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">STK:</span>
                                      <span className="text-sm font-mono font-semibold">{method.accountNumber}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(method.accountNumber!, `account-gen-${method.id}`)}
                                      >
                                        {copiedText === `account-gen-${method.id}` ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-gray-400" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {transferContent && donationSubmitted && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                      <p className="text-xs text-gray-600 mb-1 font-semibold">Nội dung chuyển khoản:</p>
                                      <p className="text-sm font-mono font-bold text-gray-900 break-all">{transferContent}</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2 h-7 text-xs"
                                        onClick={() => copyToClipboard(transferContent, `transfer-gen-${method.id}`)}
                                      >
                                        {copiedText === `transfer-gen-${method.id}` ? (
                                          <>
                                            <Check className="h-3 w-3 mr-1 text-green-600" />
                                            Đã sao chép
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="h-3 w-3 mr-1" />
                                            Sao chép
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}

                                  {method.bankName && (
                                    <p className="text-sm text-gray-600">
                                      Ngân hàng: <span className="font-semibold">{method.bankName}</span>
                                    </p>
                                  )}

                                  {method.accountName && (
                                    <p className="text-sm text-gray-600">
                                      Chủ TK: <span className="font-semibold">{method.accountName}</span>
                                    </p>
                                  )}

                                  {method.phone && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-600">SĐT:</span>
                                      <span className="text-sm font-mono font-semibold">{method.phone}</span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(method.phone!, `phone-gen-${method.id}`)}
                                      >
                                        {copiedText === `phone-gen-${method.id}` ? (
                                          <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                          <Copy className="h-3 w-3 text-gray-400" />
                                        )}
                                      </Button>
                                    </div>
                                  )}

                                  {method.qrCode && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <p className="text-sm text-gray-600 mb-2">Quét mã QR để thanh toán</p>
                                      <div className="relative w-32 h-32 bg-white p-2 rounded-lg border border-gray-200">
                                        {method.qrCode.startsWith("data:image") || method.qrCode.startsWith("http") ? (
                                          <Image
                                            src={method.qrCode}
                                            alt="QR Code"
                                            fill
                                            className="object-contain rounded"
                                            unoptimized
                                          />
                                        ) : (
                                          <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                                            <QrCode className="h-12 w-12 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {method.instructions && (
                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                      <p className="text-xs text-gray-500 whitespace-pre-line">{method.instructions}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">Chưa có phương thức thanh toán nào</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Donations */}
                  {recentDonations.length > 0 && (
                    <Card className="border-2 border-gray-100 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                          <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                          Quyên góp gần đây
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          {recentDonations.map((donation) => (
                            <div
                              key={donation.id}
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:border-green-200 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm text-gray-900 truncate">
                                    {donation.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {formatTimeAgo(donation.createdAt)}
                                  </p>
                                </div>
                              </div>
                              <span className="font-bold text-green-600 text-sm flex-shrink-0 ml-2">
                                {donation.amount.toLocaleString("vi-VN")}đ
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Link
                            href="/transparency"
                            className="text-sm text-green-600 hover:text-green-700 font-semibold text-center block"
                          >
                            Xem tất cả quyên góp →
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Tổng quan quyên góp
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cùng xem những con số biết nói về sự ủng hộ của cộng đồng
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <DollarSign className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  ) : donationStats.totalDonations >= 1000000000 ? (
                    `${(donationStats.totalDonations / 1000000000).toFixed(1)}T+`
                  ) : donationStats.totalDonations >= 1000000 ? (
                    `${(donationStats.totalDonations / 1000000).toFixed(0)}M+`
                  ) : donationStats.totalDonations >= 1000 ? (
                    `${(donationStats.totalDonations / 1000).toFixed(0)}K+`
                  ) : (
                    donationStats.totalDonations.toLocaleString("vi-VN")
                  )}
                </h3>
                <p className="text-gray-600 font-medium">VND đã quyên góp</p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  ) : (
                    `${donationStats.donationCount.toLocaleString("vi-VN")}+`
                  )}
                </h3>
                <p className="text-gray-600 font-medium">Lượt quyên góp</p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  ) : (
                    `${donationStats.peopleSupported.toLocaleString("vi-VN")}+`
                  )}
                </h3>
                <p className="text-gray-600 font-medium">Người được hỗ trợ</p>
              </CardContent>
            </Card>
            <Card className="text-center border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="pt-6">
                <div className="bg-gradient-to-r from-red-400 to-orange-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-md">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">100%</h3>
                <p className="text-gray-600 font-medium">Minh bạch tài chính</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparency Note */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12 text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 font-poppins">
                Cam kết minh bạch
              </h2>
              <p className="text-lg mb-6 opacity-95">
                Chúng tôi cam kết sử dụng mọi đồng quyên góp một cách minh bạch và hiệu quả. 
                Tất cả các khoản thu chi đều được công khai trên website và báo cáo định kỳ.
              </p>
              <Button asChild variant="secondary" size="lg" className="bg-white text-orange-500 hover:bg-gray-50 font-semibold shadow-lg">
                <Link href="/transparency">
                  Xem báo cáo tài chính
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}