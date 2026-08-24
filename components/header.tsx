"use client"

import { Search, Bell, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md border border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search with AI (Ctrl + K)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* New Foundry Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">New Foundry</span>
          <div className="w-10 h-5 bg-primary rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary-foreground rounded-full" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm">
          <button className="text-muted-foreground hover:text-foreground">Home</button>
          <button className="text-muted-foreground hover:text-foreground">Discover</button>
          <button className="text-foreground font-medium">Build</button>
          <button className="text-muted-foreground hover:text-foreground">Manage</button>
          <button className="text-muted-foreground hover:text-foreground">Docs</button>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
        </div>
      </div>
    </header>
  )
}
