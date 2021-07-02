
[].forEach.call(document.getElementsByClassName('tags-input'), function (el) {
  // Get list of existing tags
  const tagsList = allTags.map((e) => {
    return e.name
  })
  // Create a hidden html input which will store all the created tag words
  const hiddenInput = document.createElement('input')
  hiddenInput.setAttribute('type', 'hidden')
  hiddenInput.setAttribute('name', el.getAttribute('data-name'))
  let count = 0
  const tagCount = document.getElementById('tag-counter')

  // Create an input for user to enter new tags
  const mainInput = document.createElement('input')
  mainInput.placeholder = 'Press enter to add tag'

  // Create space for suggestions list
  const suggestions = document.createElement('div')
  const suggestionsList = document.createElement('ul')
  suggestions.appendChild(suggestionsList)

  // Create a list of tags
  const tags = []

  // Set the main input to be a text input
  mainInput.setAttribute('type', 'text')
  mainInput.classList.add('main-input')
  mainInput.id = 'tagsInput'

  // For every entry into the main tags input
  mainInput.addEventListener('keydown', function (e) {
    const key = e.key
    // If the user back spaces, remove the last tag
    if (key === 'Backspace' && mainInput.value.length === 0 && tags.length > 0) {
      removeTag(tags.length - 1)
    }
    // If the user hits comma or enter, filter and add the tag
    if ((key === 'Enter' || key === ',')) {
      const filteredTag = filterTag(mainInput.value)
      if (filteredTag.length > 0 && !tags.includes(filteredTag)) {
        addTag(filteredTag)
      }
      mainInput.value = ''
    }
  })

  // Append everything to the tags-input div
  el.appendChild(mainInput)
  el.appendChild(hiddenInput)
  el.appendChild(suggestions)

  // Show some example tags
  addTag(tagsList[0])
  addTag(tagsList[1])
  addTag(tagsList[2])

  // Adding tags to the list
  function addTag (text) {
    // If the tag doesn't already exist, add the tag
    if (!tags.some(tag => tag.text === text) && tags.length < 10) {
      const tag = {
        text: text,
        element: document.createElement('span')
      }

      tag.element.classList.add('tag')
      tag.element.textContent = tag.text

      const deleteBtn = document.createElement('span')
      deleteBtn.classList.add('delete')
      deleteBtn.addEventListener('click', function () {
        removeTag(tags.indexOf(tag))
      })
      tag.element.appendChild(deleteBtn)

      tags.push(tag)

      el.insertBefore(tag.element, mainInput)
      count += 1
      refreshTags()
    }
  }

  // Removing a tag from the form input
  function removeTag (index) {
    const tag = tags[index]
    tags.splice(index, 1)
    el.removeChild(tag.element)
    count -= 1
    refreshTags()
  }

  // Resetting what is and isn't in the tags list after a new tag is created or one is deleted
  function refreshTags () {
    const tagsEntered = []
    tags.forEach(function (t) {
      tagsEntered.push(t.text)
    })
    console.log(count)
    tagCount.innerHTML = String(count)
    hiddenInput.value = tagsEntered.join(',')
  }

  // Remove punctuation, capitals and spaces
  function filterTag (tag) {
    return tag.replace(/[^\w -]/g, '').trim().replace(/\W+/g, '-')
  }

  /* -------- AUTOSUGGEST TAGS --------- */
  /* --- based on pre-existing tags ---  */

  function search (str) {
    const currentTags = tags.map(tag => tag.text)
    const unused = tagsList.filter(x => !currentTags.includes(x))
    const results = []
    const val = str.toLowerCase()

    for (let i = 0; i < unused.length; i++) {
      if (unused[i].toLowerCase().indexOf(val) > -1) {
        results.push(unused[i])
      }
    }

    return results.splice(0, 3)
  }

  function searchHandler (e) {
    const inputVal = e.currentTarget.value
    let results = []
    if (inputVal.length > 0) {
      results = search(inputVal)
    }
    showSuggestions(results, inputVal)
  }

  function showSuggestions (results, inputVal) {
    suggestions.innerHTML = ''

    if (results.length > 0) {
      for (let i = 0; i < results.length; i++) {
        let item = results[i]
        // Highlights only the first match
        // TODO: highlight all matches
        const match = item.match(new RegExp(inputVal, 'i'))
        item = item.replace(match[0], `<strong>${match[0]}</strong>`)
        suggestions.innerHTML += `<li>${item}</li>`
      }
      suggestions.classList.add('has-suggestions')
    } else {
      results = []
      suggestions.innerHTML = ''
      suggestions.classList.remove('has-suggestions')
    }
  }

  function useSuggestion (e) {
    mainInput.value = e.target.innerText
    mainInput.focus()
    suggestions.innerHTML = ''
    suggestions.classList.remove('has-suggestions')
  }

  mainInput.addEventListener('keydown', searchHandler)
  suggestions.addEventListener('click', useSuggestion)
})
