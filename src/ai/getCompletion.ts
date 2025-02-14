import { OpenAI } from 'openai'

import { SYSTEM_PROMPT } from './SYSTEM_PROMPT'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export const getCompletion = async (
  topic: string,
  exampleText: string,
  wordCount: number = 500,
): Promise<string> => {
  try {
    // will also need to limit the topic and example text to a certain number of characters
    // limit wordCount to 1000
    wordCount = Math.min(wordCount, 1000)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Topic: ${topic}, Example Text: ${exampleText}, Word count: ${wordCount}`,
        },
      ],
      max_tokens: 1500, // TO DO: play with this to see how it goes
      temperature: 0.7,
    })

    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content.trim()
    } else {
      throw new Error('No completion received from OpenAI')
    }
  } catch (error) {
    console.error('Error fetching completion:', error)
    return 'Error: Unable to generate completion.'
  }
}
