import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UsersRound, Award, Mail, Phone, Facebook, Linkedin, Sparkles, Heart, Star } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { SafeImage } from "@/components/safe-image"

async function getTeamMembers() {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { role: "asc" },
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    })
    console.log(`[Team] Fetched ${members.length} team members`)
    return members || []
  } catch (error) {
    console.error("Error fetching team members:", error)
    // Return empty array on error to prevent page crash
    return []
  }
}

// Enable ISR for team page - revalidate every 30 seconds (faster updates)
export const revalidate = 30

export default async function TeamPage() {
  const allMembers = await getTeamMembers()
  
  const executiveTeam = allMembers.filter(m => m.role === "executive")
  const volunteers = allMembers.filter(m => m.role === "volunteer")
  const supporters = allMembers.filter(m => m.role === "expert") // expert = hỗ trợ

  const renderMemberCard = (member: any, icon: any, iconColor: string, accentColor: string) => (
    <Card key={member.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-200 bg-white">
      {/* Image/Icon Section */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {member.image ? (
          <div className="relative w-full h-full">
            <SafeImage 
              src={member.image} 
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              placeholder="/api/placeholder/400/400"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className={`${iconColor} rounded-full p-8 transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        )}
        {/* Role badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${accentColor} text-white shadow-lg`}>
            {member.role === "executive" ? "Lãnh đạo" : member.role === "volunteer" ? "Tình nguyện" : "Hỗ trợ"}
          </span>
        </div>
      </div>
      
      <CardContent className="p-6">
        {/* Name and Position */}
        <div className="mb-3">
          <h3 className="text-xl font-bold mb-1 group-hover:text-orange-500 transition-colors">
            {member.name}
          </h3>
          <p className={`text-sm font-semibold ${accentColor.includes('orange') ? 'text-orange-600' : accentColor.includes('green') ? 'text-green-600' : 'text-purple-600'}`}>
            {member.position}
          </p>
        </div>
        
        {/* Bio */}
        {member.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
            {member.bio}
          </p>
        )}
        
        {/* Social Links */}
        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="p-2 rounded-full bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-all duration-200 hover:scale-110"
              title={member.email}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
          {member.phone && (
            <a 
              href={`tel:${member.phone}`}
              className="p-2 rounded-full bg-gray-50 hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-all duration-200 hover:scale-110"
              title={member.phone}
            >
              <Phone className="h-4 w-4" />
            </a>
          )}
          {member.facebookUrl && (
            <a 
              href={member.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-110"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {member.linkedinUrl && (
            <a 
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-700 transition-all duration-200 hover:scale-110"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-full p-4 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              Đội ngũ của chúng tôi
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Những con người tâm huyết đang ngày đêm cống hiến cho sứ mệnh cao cả
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500 mb-1">{executiveTeam.length}</div>
                <div className="text-sm text-gray-600">Lãnh đạo</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-1">{volunteers.length}</div>
                <div className="text-sm text-gray-600">Tình nguyện viên</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500 mb-1">{supporters.length}</div>
                <div className="text-sm text-gray-600">Hỗ trợ viên</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-1">{allMembers.length}</div>
                <div className="text-sm text-gray-600">Tổng thành viên</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Board */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-full p-4 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Ban điều hành
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những người lãnh đạo có kinh nghiệm và tâm huyết, định hướng chiến lược phát triển của tổ chức.
            </p>
          </div>
          {executiveTeam.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {executiveTeam.map(member => renderMemberCard(
                member,
                <Users className="h-16 w-16 text-white" />,
                "bg-gradient-to-r from-orange-400 to-orange-500",
                "bg-gradient-to-r from-orange-400 to-orange-500"
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có thành viên ban điều hành</p>
            </div>
          )}
        </div>
      </section>

      {/* Volunteers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full p-4 shadow-lg">
                <UsersRound className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Tình nguyện viên
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những bạn trẻ nhiệt huyết, sẵn sàng cống hiến thời gian và công sức cho các hoạt động thiện nguyện.
            </p>
          </div>
          {volunteers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {volunteers.map(member => renderMemberCard(
                  member,
                  <UsersRound className="h-16 w-16 text-white" />,
                  "bg-gradient-to-r from-green-400 to-green-500",
                  "bg-gradient-to-r from-green-400 to-green-500"
                ))}
              </div>
              <div className="text-center mt-12">
                <Button asChild variant="outline" className="border-2 border-green-500 bg-transparent text-green-600 hover:bg-green-50 px-8 py-3 text-lg font-semibold">
                  <Link href="/contact">
                    Tham gia cùng chúng tôi
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <UsersRound className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có tình nguyện viên</p>
              <div className="mt-6">
                <Button asChild variant="outline" className="border-2 border-green-500 bg-transparent text-green-600 hover:bg-green-50 font-semibold">
                  <Link href="/contact">
                    Trở thành tình nguyện viên đầu tiên
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Supporters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Hỗ trợ
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Các cá nhân và tổ chức hỗ trợ tư vấn và triển khai dự án trong lĩnh vực giáo dục, y tế, xây dựng.
            </p>
          </div>
          {supporters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {supporters.map(member => renderMemberCard(
                member,
                <Award className="h-16 w-16 text-white" />,
                "bg-gradient-to-r from-purple-400 to-pink-500",
                "bg-gradient-to-r from-purple-400 to-pink-500"
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có hỗ trợ viên</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
            Tham gia cùng chúng tôi
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Bạn có muốn trở thành một phần của đội ngũ đầy nhiệt huyết này?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-orange-500 hover:bg-gray-50">
              <Link href="/contact">
                Liên hệ ngay
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-orange-500 px-8 py-3 font-semibold">
              <Link href="/activities">
                Xem hoạt động
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
