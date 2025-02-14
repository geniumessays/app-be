import { getCompletion } from '../ai/getCompletion'

export const generateEssay = async (req, res) => {
  try {
    const { topic, exampleText, wordCount } = req.body
    const newEssay = await getCompletion(topic, exampleText, wordCount)

    res.json({ response: newEssay })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
