import '../config/init.js'
import PluginsLoader from '../plugins/loader.js'
import bot from '../bot.js'

class WebPluginCommand {
  async run (e) {
    await bot.run()
    await PluginsLoader.load()
    await PluginsLoader.deal(e)
    return {
      status: 0,
      message: 'success'
    }
  }
}

export default new WebPluginCommand()
