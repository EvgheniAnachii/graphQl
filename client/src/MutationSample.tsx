import React, { memo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { gql } from './__generated__'

const INCREMENT_TRACK_VIEWS = gql(`
  mutation IncrementTrackViews($incrementTrackViewsId: ID!) {
    incrementTrackViews(id: $incrementTrackViewsId) {
      code
      success
      message
      track {
        id
        numberOfViews
      }
    }
  }
`)
const MutationSample = () => {
  const [isDisabled, setIsDisabled] = useState(false)
  const [incrementTrackViews] = useMutation(INCREMENT_TRACK_VIEWS, {
    variables: { incrementTrackViewsId: 'c_0' },
    onCompleted: (data) => {
      console.log(data)
      setIsDisabled(false)
    },
  })

  const incrementCount = async () => {
    setIsDisabled(true)
    await incrementTrackViews()
  }

  return (
    <div>
      <button disabled={isDisabled} onClick={incrementCount}>
        Increment Count
      </button>
    </div>
  )
}

export default MutationSample
