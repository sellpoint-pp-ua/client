export const dynamic = 'force-dynamic'

import TrackResultsClient from './TrackResultsClient'

export default function TrackResultsPage() {
	// Server wrapper — client logic lives in TrackResultsClient
	return <TrackResultsClient />
}


