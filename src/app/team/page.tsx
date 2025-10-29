import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UsersRound, Award, Mail, Phone, Facebook, Linkedin } from "lucide-react"
import { prisma } from "@/lib/prisma"

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
    return members
  } catch (error) {
    console.error("Error fetching team members:", error)
    return []
  }
}

export default async function TeamPage() {
  const allMembers = await getTeamMembers()
  
  const executiveTeam = allMembers.filter(m => m.role === "executive")
  const volunteers = allMembers.filter(m => m.role === "volunteer")
  const supporters = allMembers.filter(m => m.role === "expert") // expert = hỗ trợ

  const renderMemberCard = (member: any, icon: any, iconColor: string) => (
    <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
        {member.image ? (
          <img 
            src={member.image} 
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`${iconColor} rounded-full p-6`}>
            {icon}
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-1">{member.name}</h3>
        <p className="text-sm text-orange-500 font-semibold mb-3">{member.position}</p>
        {member.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>
        )}
        <div className="flex items-center space-x-2 pt-4 border-t">
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="text-gray-400 hover:text-orange-500 transition-colors"
              title={member.email}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
          {member.phone && (
            <a 
              href={`tel:${member.phone}`}
              className="text-gray-400 hover:text-orange-500 transition-colors"
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
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
          {member.linkedinUrl && (
            <a 
              href={member.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-700 transition-colors"
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
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              Đội ngũ của chúng tôi
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Những con người tâm huyết đang ngày đêm cống hiến cho sứ mệnh cao cả
            </p>
          </div>
        </div>
      </section>

      {/* Executive Board */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-full p-4">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Ban điều hành
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những người lãnh đạo có kinh nghiệm và tâm huyết, định hướng chiến lược phát triển của tổ chức.
            </p>
            <p className="text-sm text-gray-500 mt-2">{executiveTeam.length} thành viên</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {executiveTeam.map(member => renderMemberCard(
              member,
              <Users className="h-12 w-12 text-white" />,
              "bg-gradient-to-r from-orange-400 to-orange-500"
            ))}
          </div>
        </div>
      </section>

      {/* Volunteers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-teal-400 to-green-500 rounded-full p-4">
                <UsersRound className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Tình nguyện viên
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những bạn trẻ nhiệt huyết, sẵn sàng cống hiến thời gian và công sức cho các hoạt động thiện nguyện.
            </p>
            <p className="text-sm text-gray-500 mt-2">{volunteers.length}+ thành viên</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {volunteers.map(member => renderMemberCard(
              member,
              <UsersRound className="h-12 w-12 text-white" />,
              "bg-gradient-to-r from-teal-400 to-green-500"
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
              <Link href="/contact">
                Tham gia cùng chúng tôi
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Supporters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Hỗ trợ
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Các cá nhân và tổ chức hỗ trợ tư vấn và triển khai dự án trong lĩnh vực giáo dục, y tế, xây dựng.
            </p>
            <p className="text-sm text-gray-500 mt-2">{supporters.length}+ người hỗ trợ</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supporters.map(member => renderMemberCard(
              member,
              <Award className="h-12 w-12 text-white" />,
              "bg-gradient-to-r from-purple-400 to-pink-500"
            ))}
          </div>
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
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-500">
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
