import fs from 'fs'
import path from 'path'

interface ScrapedData {
  title: string
  essay: string
}

interface TrainingExample {
  messages: {
    role: 'system' | 'user' | 'assistant'
    content: string
  }[]
}

async function prepareTrainingData() {
  try {
    // Read the scraped essays
    const essaysPath = path.join(__dirname, 'essay-lite.json')
    const essays: ScrapedData[] = JSON.parse(
      fs.readFileSync(essaysPath, 'utf-8'),
    )

    // Prepare training examples
    const trainingData: TrainingExample[] = essays.map((essay) => ({
      messages: [
        {
          role: 'system',
          content:
            'You are a talented writer, capable of writing in any style. However, you must always match the style provided by the user.',
        },
        {
          role: 'user',
          content: `Topic: ${essay.title}, Example Text: ${essay.essay.substring(0, 200)}..., Word count: ${essay.essay.split(/\s+/).length}`,
        },
        {
          role: 'assistant',
          content: essay.essay,
        },
      ],
    }))

    // Save the training data
    const outputPath = path.join(__dirname, 'training_data.jsonl')
    const jsonlContent = trainingData
      .map((example) => JSON.stringify(example))
      .join('\n')

    fs.writeFileSync(outputPath, jsonlContent)
    console.log(`Prepared ${trainingData.length} training examples`)
    console.log(`Training data saved to ${outputPath}`)
  } catch (error) {
    console.error('Error preparing training data:', error)
  }
}

prepareTrainingData()
