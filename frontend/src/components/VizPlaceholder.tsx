import { Card, CardContent } from '@/components/ui/card'

export default function VizPlaceholder({ concept }: { concept: string }) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-2">🔍 Visualizing:</h2>
        <p className="text-gray-800 text-md italic">{concept}</p>
        <div className="mt-4 text-sm text-gray-500">
          [ This is where the visualization will appear. ]
        </div>
      </CardContent>
    </Card>
  )
}
