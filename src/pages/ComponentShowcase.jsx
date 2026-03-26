import React, { useState } from 'react'
import { Button } from '../components/ui/button-new'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card-new'
import { Input } from '../components/ui/input-new'
import { Badge } from '../components/ui/badge-new'
import { ProgressStepper } from '../components/ui/progress-stepper'
import { Mail, Search, Send, User, Bell, ChevronRight, Activity } from 'lucide-react'

function ComponentShowcase() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const handleAction = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 2000)
    }

    const steps = [
        { label: 'Patient Story', description: 'Read history' },
        { label: 'Investigation', description: 'Ask questions' },
        { label: 'Diagnosis', description: 'Formulate' },
        { label: 'Feedback', description: 'Review results' }
    ]

    return (
        <div className="min-h-screen bg-bg-secondary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
                
                <header className="text-center">
                    <h1 className="text-4xl font-extrabold text-text-primary tracking-tight">UI Component Library</h1>
                    <p className="mt-4 text-lg text-text-secondary">Strictly following the PhysioMentor design system.</p>
                </header>

                {/* Buttons */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-primary border-b pb-2">Buttons</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="error">Error Action</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button variant="primary" size="sm">Small</Button>
                        <Button variant="primary" size="md">Medium</Button>
                        <Button variant="primary" size="lg">Large Size</Button>
                        <Button variant="primary" isLoading={loading} onClick={handleAction}>
                            Click to Load
                        </Button>
                        <Button variant="primary" disabled>Disabled State</Button>
                    </div>
                </section>

                {/* Cards */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-primary border-b pb-2">Cards</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Default Card</CardTitle>
                                <CardDescription>Clean and minimal container.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-text-secondary">This is a standard content area. It follows the 8px grid spacing.</p>
                            </CardContent>
                            <CardFooter>
                                <Button size="sm" variant="outline" className="w-full">Action</Button>
                            </CardFooter>
                        </Card>

                        <Card variant="interactive">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity size={20} className="text-primary" />
                                    Interactive Card
                                </CardTitle>
                                <CardDescription>Hover to see the effect.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-text-secondary">Perfect for library items or case selection cards.</p>
                            </CardContent>
                        </Card>

                        <Card variant="highlighted">
                            <CardHeader>
                                <CardTitle>Highlighted Card</CardTitle>
                                <CardDescription>For important focus areas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-text-secondary">Uses a primary 2px border to stand out from others.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Inputs */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-primary border-b pb-2">Forms & Inputs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-text-primary">Email Address</label>
                            <Input placeholder="Enter your email" type="email" />
                            
                            <label className="text-sm font-semibold text-text-primary">Search Cases</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-text-muted" />
                                <Input className="pl-10" placeholder="Search physical tests..." />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-text-primary">Error State</label>
                            <Input 
                                defaultValue="invalid-input" 
                                error="Please enter a valid clinical code" 
                            />
                            
                            <label className="text-sm font-semibold text-text-primary">Disabled</label>
                            <Input disabled placeholder="Disabled field" />
                        </div>
                    </div>
                </section>

                {/* Badges */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-primary border-b pb-2">Badges & Status</h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Badge variant="success">Active</Badge>
                        <Badge variant="warning">Draft</Badge>
                        <Badge variant="error">Critical</Badge>
                        <Badge variant="info">New Case</Badge>
                        <Badge>Default</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Badge size="md" variant="success">Large Success</Badge>
                        <Badge size="md" variant="info">Large Info</Badge>
                    </div>
                </section>

                {/* Progress Stepper */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-text-primary border-b pb-2">Progress Stepper</h2>
                    <Card padding="lg">
                        <ProgressStepper steps={steps} currentStep={step} />
                        <div className="mt-12 flex justify-between">
                            <Button 
                                variant="outline" 
                                onClick={() => setStep(Math.max(0, step - 1))}
                                disabled={step === 0}
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                                disabled={step === steps.length - 1}
                            >
                                Next Step
                            </Button>
                        </div>
                    </Card>
                </section>

            </div>
        </div>
    )
}

export default ComponentShowcase
