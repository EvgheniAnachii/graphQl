import React, { memo } from 'react'
import { gql } from './__generated__'
import { useQuery } from '@apollo/client'

const GET_TRACK = gql(`
  query GetTrack($trackId: ID!) {
    track(id: $trackId) {
      myClientField @client
      id
      title
      author {
        id
        name
        photo
      }
      thumbnail
      length
      modulesCount
      numberOfViews
      modules {
        id
        title
        length
      }
      description
    }
  }
`)

const QuerySample = () => {
  const { loading, error, data } = useQuery(GET_TRACK, {
    variables: { trackId: 'c_0' },
  })

  return (
    <>
      {loading ? (
        <div>Getting tracks...</div>
      ) : (
        <div>Number of view when queried: {data?.track.numberOfViews}</div>
      )}
    </>
  )
}
export default memo(QuerySample)
