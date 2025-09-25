"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { SoftUICard } from "./soft-ui-card"
import { SoftUISwitch } from "./soft-ui-switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Moon, Sun, Bell, Download, Upload, Trash2, User, Shield, Palette, Database } from "lucide-react"

interface SettingsScreenProps {
  onBack: () => void
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    soundEffects: false,
    animationsEnabled: true,
    compactMode: false,
    userName: "Garden Keeper",
    email: "keeper@brainbloom.app",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleDarkModeToggle = (checked: boolean) => {
    console.log("[v0] Dark mode toggle:", checked, "Current theme:", theme)
    setTheme(checked ? "dark" : "light")
  }

  if (!mounted) {
    return null
  }

  const settingSections = [
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          key: "darkMode",
          label: "Dark Mode",
          description: "Switch to a darker theme for comfortable night reading",
          type: "toggle" as const,
          icon: theme === "dark" ? Moon : Sun,
        },
        {
          key: "animationsEnabled",
          label: "Animations",
          description: "Enable smooth transitions and micro-interactions",
          type: "toggle" as const,
          icon: Palette,
        },
        {
          key: "compactMode",
          label: "Compact Mode",
          description: "Reduce spacing for more content on screen",
          type: "toggle" as const,
          icon: Palette,
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          key: "notifications",
          label: "Push Notifications",
          description: "Receive notifications for reminders and updates",
          type: "toggle" as const,
          icon: Bell,
        },
        {
          key: "soundEffects",
          label: "Sound Effects",
          description: "Play subtle sounds for interactions and notifications",
          type: "toggle" as const,
          icon: Bell,
        },
      ],
    },
    {
      title: "Data & Storage",
      icon: Database,
      items: [
        {
          key: "autoSave",
          label: "Auto-save",
          description: "Automatically save changes as you type",
          type: "toggle" as const,
          icon: Database,
        },
      ],
    },
    {
      title: "Account",
      icon: User,
      items: [
        {
          key: "userName",
          label: "Display Name",
          description: "Your name as it appears in BrainBloom",
          type: "input" as const,
          icon: User,
        },
        {
          key: "email",
          label: "Email Address",
          description: "Your email for account recovery and notifications",
          type: "input" as const,
          icon: User,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={onBack} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-3xl font-serif text-foreground font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground text-pretty">
            Customize your BrainBloom experience to match your preferences and workflow.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {settingSections.map((section, sectionIndex) => (
            <div
              key={section.title}
              className="animate-in slide-in-from-bottom-4 fade-in duration-500"
              style={{ animationDelay: `${sectionIndex * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <section.icon className="w-5 h-5 text-accent-peach" />
                <h2 className="text-xl font-serif font-semibold text-foreground">{section.title}</h2>
              </div>

              <SoftUICard className="p-6 space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <item.icon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground mb-1">{item.label}</div>
                        <div className="text-sm text-muted-foreground text-pretty">{item.description}</div>
                      </div>
                    </div>

                    <div className="ml-4">
                      {item.type === "toggle" ? (
                        <SoftUISwitch
                          checked={
                            item.key === "darkMode"
                              ? theme === "dark"
                              : (settings[item.key as keyof typeof settings] as boolean)
                          }
                          onChange={(checked) => {
                            console.log("[v0] Toggle changed:", item.key, checked)
                            item.key === "darkMode" ? handleDarkModeToggle(checked) : updateSetting(item.key, checked)
                          }}
                        />
                      ) : (
                        <div className="w-48">
                          <SoftUICard pressed className="p-2">
                            <Input
                              value={settings[item.key as keyof typeof settings] as string}
                              onChange={(e) => updateSetting(item.key, e.target.value)}
                              className="border-none bg-transparent focus:ring-0 focus:outline-none text-sm"
                            />
                          </SoftUICard>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </SoftUICard>
            </div>
          ))}

          {/* Data Management Section */}
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-accent-lavender" />
              <h2 className="text-xl font-serif font-semibold text-foreground">Data Management</h2>
            </div>

            <SoftUICard className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex items-center gap-2 rounded-2xl h-12 bg-transparent">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>

                <Button variant="outline" className="flex items-center gap-2 rounded-2xl h-12 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Import Data
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 rounded-2xl h-12 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              </div>
            </SoftUICard>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>BrainBloom v1.0.0 - Your Digital Garden of Ideas</p>
          <p className="mt-1">Made with care for thoughtful minds</p>
        </div>
      </div>
    </div>
  )
}
