import Header from '@/components/layout/Header'
import AccountSidebar from '@/components/account/AccountSidebar'
import SiteFooter from '@/components/layout/SiteFooter'
import SettingsForm from '@/components/account/SettingsForm'

export default async function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 flex-1">
        <div className="flex gap-6">
          <div className="w-80 hidden lg:block flex-shrink-0">
            <AccountSidebar />
          </div>
          <section className="flex-1">
            <div className="rounded-xl bg-white shadow-sm p-6">
              <h1 className="text-xl font-semibold text-gray-900">Налаштування</h1>
              <p className="text-sm text-gray-500">Твій профіль на Sell Point</p>
            </div>
            <SettingsForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}


