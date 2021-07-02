const { GroupSchema } = require('../db/groups')
const { StudentProfile } = require('../db/studentProfiles')
const { Tag } = require('../db/tags')
const { Poll, KickReasons } = require('../db/poll')
const pollControl = require('./poll')

module.exports.search = async (req, res) => {
    if (req.query.search) { // get search results
        const regex = new RegExp(req.query.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'gi') // 'gi' are flags, g - global, i - ignore case

        // user searched something
        const foundGroups = await GroupSchema.find({ name: regex}).populate(['members', 'polls', 'tags'])
        const foundStudents = await StudentProfile.find({ $or: [{ firstName: regex }, { lastName: regex }, { username: regex }] })
        let tags = await Tag.find({name: regex})
        tags = tags.map(t=>t._id)
        const groupsWithTags = await GroupSchema.find({tags:{$in: tags}}).populate(['tags'])
        let total =  foundGroups.length + foundStudents.length + groupsWithTags.length
        return res.render('searchResults', {foundGroups: foundGroups, groupsWithTags: groupsWithTags, foundStudents: foundStudents, userSearched: req.query.search, total: total })
    }
    return res.redirect('back')

}
