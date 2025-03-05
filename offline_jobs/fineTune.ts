import { OpenAI } from 'openai'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function uploadTrainingFile() {
  try {
    const file = await openai.files.create({
      file: fs.createReadStream(path.join(__dirname, 'training_data.jsonl')),
      purpose: 'fine-tune',
    })
    console.log('Training file uploaded:', file.id)
    return file.id
  } catch (error) {
    console.error('Error uploading training file:', error)
    throw error
  }
}

async function createFineTuningJob(fileId: string) {
  try {
    const job = await openai.fineTuning.jobs.create({
      training_file: fileId,
      model: 'gpt-4o-mini-2024-07-18',
      hyperparameters: {
        n_epochs: 3,
      },
    })
    console.log('Fine-tuning job created:', job.id)
    return job.id
  } catch (error) {
    console.error('Error creating fine-tuning job:', error)
    throw error
  }
}

async function checkFineTuningStatus(jobId: string) {
  try {
    const job = await openai.fineTuning.jobs.retrieve(jobId)
    console.log('Fine-tuning status:', job.status)
    return job
  } catch (error) {
    console.error('Error checking fine-tuning status:', error)
    throw error
  }
}

async function fineTune() {
  try {
    // Step 1: Upload training file
    const fileId = await uploadTrainingFile()

    // Step 2: Create fine-tuning job
    const jobId = await createFineTuningJob(fileId)

    // Step 3: Monitor the job status
    let job
    do {
      job = await checkFineTuningStatus(jobId)
      if (job.status === 'succeeded') {
        console.log('Fine-tuning completed successfully!')
        console.log('Fine-tuned model:', job.fine_tuned_model)
        break
      } else if (job.status === 'failed') {
        console.error('Fine-tuning failed:', job.error)
        break
      }
      // Wait for 5 minutes before checking again
      await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000))
    } while (
      job.status === 'validating_files' ||
      job.status === 'queued' ||
      job.status === 'running'
    )
  } catch (error) {
    console.error('Error during fine-tuning:', error)
  }
}

fineTune()
