import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UsersRound, Award, Mail, Phone, Facebook, Linkedin } from "lucide-react"

export default function TeamPage() {
  // Sample data - sẽ lấy từ database sau
  const executiveTeam = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      position: "Chủ tịch",
      bio: "Hơn 15 năm kinh nghiệm trong lĩnh vực phát triển cộng đồng và xã hội",
      image: "",
      email: "nguyenvana@example.com",
      phone: "+84 123 456 789",
    },
    {
      id: 2,
      name: "Trần Thị B",
      position: "Phó Chủ tịch",
      bio: "Chuyên gia về giáo dục và phát triển trẻ em vùng cao",
      image: "",
      email: "tranthib@example.com",
    },
    {
      id: 3,
      name: "Lê Văn C",
      position: "Thành viên Ban điều hành",
      bio: "Nhiệt huyết với các hoạt động thiện nguyện và hỗ trợ cộng đồng",
      image: "",
    },
  ]

  const volunteers = [
    {
      id: 1,
      name: "Phạm Thị D",
      position: "Tình nguyện viên",
      bio: "Sinh viên năm 3, tham gia từ 2023",
      image: "",
    },
    {
      id: 2,
      name: "Hoàng Văn E",
      position: "Tình nguyện viên",
      bio: "Cựu sinh viên, tham gia từ 2022",
      image: "",
    },
    {
      id: 3,
      name: "Vũ Thị F",
      position: "Tình nguyện viên",
      bio: "Nhân viên văn phòng, tham gia từ 2024",
      image: "",
    },
  ]

  const experts = [
    {
      id: 1,
      name: "Đỗ Văn G",
      position: "Chuyên gia Giáo dục",
      bio: "Thạc sĩ Giáo dục, 10 năm kinh nghiệm giảng dạy",
      image: "",
      email: "dovang@example.com",
    },
    {
      id: 2,
      name: "Bùi Thị H",
      position: "Chuyên gia Y tế",
      bio: "Bác sĩ, chuyên về y tế cộng đồng vùng cao",
      image: "",
    },
    {
      id: 3,
      name: "Ngô Văn I",
      position: "Chuyên gia Xây dựng",
      bio: "Kỹ sư xây dựng, chuyên thiết kế cơ sở hạ tầng nông thôn",
      image: "",
    },
  ]

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

      {/* Experts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-4">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Chuyên gia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Các chuyên gia trong lĩnh vực giáo dục, y tế, xây dựng hỗ trợ tư vấn và triển khai dự án.
            </p>
            <p className="text-sm text-gray-500 mt-2">{experts.length}+ chuyên gia</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {experts.map(member => renderMemberCard(
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
