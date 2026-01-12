import { Button } from "~/components/ui/button";
import type { Route } from "../../+types/root";
import { Link } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Layout,
  Users2,
  Zap,
} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Taskbob" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* --- Navigation --- */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            Taskly
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/sign-in">
              <Button variant="ghost" className="text-sm font-medium">
                Log in
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button className="text-sm font-medium">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* --- Hero Section --- */}
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container mx-auto flex max-w-5xl flex-col items-center gap-4 text-center px-4">
            <div className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
              🚀 The new standard for project management
            </div>
            <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Manage your Workspaces, <br className="hidden md:block" />
              <span className="text-primary">Master your Tasks.</span>
            </h1>
            <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Taskly brings your team together. Create workspaces, organize
              projects, assign members, and track progress—all in one place.
            </p>
            <div className="space-x-4">
              <Link to="/sign-up">
                <Button size="lg" className="gap-2 px-8 h-12 text-base">
                  Start for Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base"
                >
                  Existing User
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- Features Grid --- */}
        <section className="container mx-auto space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24 px-4 sm:px-8 rounded-3xl my-8">
          <div className="mx-auto flex max-w-232 flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">
              Everything you need
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Streamline your workflow with tools designed for modern teams.
            </p>
          </div>

          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-5xl md:grid-cols-3 pt-8">
            {/* Feature 1 */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-45 flex-col justify-between rounded-md p-6">
                <Layout className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Workspaces</h3>
                  <p className="text-sm text-muted-foreground">
                    Create distinct workspaces for different companies, clients,
                    or departments.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-45 flex-col justify-between rounded-md p-6">
                <Layers className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Project Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize tasks into projects. Track status, priority, and
                    deadlines effortlessly.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-45 flex-col justify-between rounded-md p-6">
                <Users2 className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Invite members, assign roles (Manager/Contributor), and
                    distribute tasks instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Simple Benefits List --- */}
        <section className="container mx-auto py-8 md:py-12 lg:py-24 px-4 sm:px-8">
          <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-12 lg:gap-x-24">
            <div className="flex flex-col justify-center gap-4">
              <h2 className="font-heading text-3xl font-bold sm:text-4xl">
                Built for focus.
              </h2>
              <p className="text-lg text-muted-foreground">
                Don't let complex tools slow you down. Taskly is designed to be
                intuitive, so you can spend less time managing and more time
                doing.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Real-time Updates</h3>
                  <p className="text-sm text-muted-foreground">
                    See changes as they happen.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Role-Based Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Control who sees what with granularity.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold">Activity Logs</h3>
                  <p className="text-sm text-muted-foreground">
                    Track every action taken in your workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="border-t bg-muted/40 py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 sm:px-8">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Zap className="h-6 w-6 text-primary" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by{" "}
              <a href="#" className="font-medium underline underline-offset-4">
                Nirupam
              </a>
              . The source code is available on GitHub.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
