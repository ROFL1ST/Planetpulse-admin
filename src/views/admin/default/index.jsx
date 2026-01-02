import Widget from "components/widgets/index";
import { Document, People, Activity, UserTick } from "iconsax-react";
import { useEffect, useState } from "react";
import api_service from "api/api_service";
import Card from "components/card";
import WeeklyChart from "./components/WeeklyChart";
import TopicPieChart from "./components/TopicPieChart";
import QuestionChart from "./components/QuestionChart";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    averageScore: 0,
    activeUsers: 0,
    totalQuestions: 0,
    weeklyStats: [],
    topicStats: [],
    hardestQuestions: [],
  });

  const [loading, setLoading] = useState(true);

  async function getAnalyticsData() {
    try {
      const res = await api_service.get("/admin/analytics");

      if (res.status === "success" && res.data) {
        setStats({
          totalUsers: res.data.total_users,
          totalQuizzes: res.data.total_quizzes,
          totalAttempts: res.data.total_attempts,
          averageScore: parseFloat(res.data.average_score).toFixed(1),
          activeUsers: res.data.active_users,
          totalQuestions: res.data.total_questions,
          weeklyStats: res.data.weekly_stats || [],
          topicStats: res.data.topic_stats || [],
          hardestQuestions: res.data.hardest_questions || [],
        });
      }
    } catch (er) {
      console.error("Gagal mengambil data analytics:", er);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAnalyticsData();
  }, []);

  return (
    <div>
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        {loading ? (
          [1, 2, 3, 4, 5].map((i, key) => (
            <Card
              key={key}
              extra="flex-grow animate-pulse !flex-row items-center rounded-[20px]"
            >
              <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
                  <span className="flex h-6 w-6 items-center rounded-full bg-gray-300 dark:bg-gray-700 dark:text-white"></span>
                </div>
              </div>

              <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="mb-2 h-3 bg-gray-300 font-dm text-sm font-medium dark:bg-gray-700">
                  &nbsp;
                </p>
                <h4 className="h-5 w-20 bg-gray-300 text-xl font-bold dark:bg-gray-700">
                  &nbsp;
                </h4>
              </div>
            </Card>
          ))
        ) : (
          <>
            <Widget
              icon={<People size="27" variant="Bulk" />}
              title={
                localStorage.getItem("role") === "pengajar"
                  ? "Total Siswa"
                  : "Total Pengguna"
              }
              subtitle={stats.totalUsers}
            />
            {localStorage.getItem("role") !== "pengajar" && (
              <Widget
                icon={<UserTick size="27" variant="Bulk" />}
                title={"Pengguna Aktif (7 Hari)"}
                subtitle={stats.activeUsers}
              />
            )}
            <Widget
              icon={<Document size="27" variant="Bulk" />}
              title={
                localStorage.getItem("role") === "pengajar"
                  ? "Total Kelas"
                  : "Total Kuis"
              }
              subtitle={stats.totalQuizzes}
            />
            <Widget
              icon={<Document size="27" variant="Bulk" />}
              title={
                localStorage.getItem("role") === "pengajar"
                  ? "Total Tugas"
                  : "Total Pertanyaan"
              }
              subtitle={stats.totalQuestions}
            />
            {localStorage.getItem("role") !== "pengajar" && (
              <>
                <Widget
                  icon={<Activity size="27" variant="Bulk" />}
                  title={"Total Pengerjaan"}
                  subtitle={stats.totalAttempts}
                />
                <Widget
                  icon={<People size="27" variant="Bulk" />}
                  title={"Rata-rata Nilai"}
                  subtitle={`${stats.averageScore} Poin`}
                />
              </>
            )}
          </>
        )}
      </div>

      {/* CHARTS SECTION */}
      {!loading && (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <WeeklyChart data={stats.weeklyStats} />
          <TopicPieChart data={stats.topicStats} />
          <div className="md:col-span-2">
            <QuestionChart data={stats.hardestQuestions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
