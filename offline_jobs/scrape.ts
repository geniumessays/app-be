import axios from 'axios'
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

interface ScrapedData {
  title: string
  essay: string
}

async function scrapePage(url: string): Promise<ScrapedData | null> {
  try {
    const response = await axios.get(url)
    const $ = cheerio.load(response.data)

    // Find the title in strong tag
    const title = $('strong').first().text().trim()

    // Find the content div
    const contentDiv = $('#content')
    const essay = contentDiv.text().trim()

    // If either title or essay is empty, return null
    if (!title || !essay) {
      console.log(`Skipping ${url} - missing required content`)
      return null
    }

    return {
      title,
      essay,
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message)
    return null
  }
}

async function getUrlsFromParentPage(parentUrl: string): Promise<string[]> {
  try {
    const response = await axios.get(parentUrl)
    const $ = cheerio.load(response.data)

    // Get the base URL (domain without path)
    const baseUrl = new URL(parentUrl).origin

    // Get all first-level links
    const links = $('a')
      .map((_, el) => $(el).attr('href'))
      .get()
    console.log('raw links:', links)

    // Process and normalize links
    const processedLinks = links
      .map((link) => {
        if (!link) return null

        try {
          // If it's already a full URL, return it
          if (link.startsWith('http')) {
            return new URL(link).toString()
          }

          // If it's a relative URL, prepend the base URL
          return new URL(link, baseUrl).toString()
        } catch (error) {
          console.log(`Invalid link found: ${link}`)
          return null
        }
      })
      .filter((link): link is string => link !== null)

    // Remove duplicates
    const uniqueLinks = [...new Set(processedLinks)]

    console.log(`Found ${uniqueLinks.length} unique valid links on parent page`)
    return uniqueLinks
  } catch (error) {
    console.error('Error getting URLs from parent page:', error.message)
    return []
  }
}

async function scrapeWebsite(parentUrl: string): Promise<void> {
  try {
    // First, get all URLs from the parent page
    const urls = await getUrlsFromParentPage(parentUrl)
    console.log('urls ', urls)

    if (urls.length === 0) {
      console.error('No valid URLs found on parent page')
      return
    }

    const results: ScrapedData[] = []

    // Process each URL
    for (const url of urls) {
      console.log(`Processing ${url}...`)
      const data = await scrapePage(url)
      if (data) {
        results.push(data)
      }
    }

    // Save results to JSON file
    // Save full results
    const outputPath = path.join(__dirname, 'essay.json')
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`Scraping complete. Results saved to ${outputPath}`)
    console.log(`Total essays collected: ${results.length}`)

    // Save lite version with first 50 essays
    const litePath = path.join(__dirname, 'essay-lite.json')
    const liteResults = results.slice(0, 50)
    fs.writeFileSync(litePath, JSON.stringify(liteResults, null, 2))
    console.log(`Lite version with first 50 essays saved to ${litePath}`)
  } catch (error) {
    console.error('Error during scraping:', error.message)
  }
}

const parentUrl = 'https://www.interruzioni.net/temi.htm'
if (!parentUrl) {
  console.error('Please provide a parent URL as a command line argument')
  process.exit(1)
}

scrapeWebsite(parentUrl)
