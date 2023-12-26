export const upgradeScripts = [
  function (context, props) {
    //customWebsocketsConfig
    let result = {
      updatedConfig: null,
      updatedActions: [],
      updatedFeedbacks: [],
    }
    if (props.config && !props.config.presetType) {
      result.updatedConfig = props.config
      result.updatedConfig.presetType = 'pvw'
    }
    return result
  },
]
