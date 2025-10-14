import { ref } from 'vue'

export function useColorGenerator(text: string) {
  console.log('Color generator', text)
  // const color = ref('#000000');
  // const generateColor = () => {
  //     color.value = '#' + Math.floor(Math.random() * 16777215).toString(16);
  // };
  // return {
  //     color,
  //     generateColor,
  // };

  const bgColor = ref('bg-neutral-100')
  const darkBgColor = ref('bg-neutral-500')
  const bgHoverColor = ref('hover:bg-neutral-200')
  const bgIconColor = ref('bg-neutral-500')
  const textColor = ref('text-neutral-800')
  const alphaNum = ref('abcdefghijklmnopqrstuvwxyz0123456789')
  const colors = ref([
    'red',
    'amber',
    'lime',
    'emerald',
    'teal',
    'sky',
    'violet',
    'fuchsia',
    'rose',
    'indigo',
    'yellow',
    'green',
    'blue',
    'purple',
    'pink',
    'gray',
    'cyan',
  ])

  const colorMapping = ref(new Map<string, string>())

  alphaNum.value.split('').forEach((char, index) => {
    const colorIndex = index % colors.value.length
    colorMapping.value.set(char, colors.value[colorIndex])
  })

  const setColor = () => {
    const firstChar = text.charAt(0).toLowerCase()
    console.log(firstChar)

    const color = colorMapping.value.get(firstChar)

    switch (color) {
      case 'red':
        bgColor.value = 'bg-red-100'
        bgHoverColor.value = 'hover:bg-red-200'
        bgIconColor.value = 'bg-red-500'
        textColor.value = 'text-red-500'
        darkBgColor.value = 'bg-red-500'
        break
      case 'amber':
        bgColor.value = 'bg-amber-100'
        bgHoverColor.value = 'hover:bg-amber-200'
        bgIconColor.value = 'bg-amber-500'
        textColor.value = 'text-amber-500'
        darkBgColor.value = 'bg-amber-500'
        break
      case 'lime':
        bgColor.value = 'bg-lime-100'
        bgHoverColor.value = 'hover:bg-lime-200'
        bgIconColor.value = 'bg-lime-500'
        textColor.value = 'text-lime-500'
        darkBgColor.value = 'bg-lime-500'
        break
      case 'emerald':
        bgColor.value = 'bg-emerald-100'
        bgHoverColor.value = 'hover:bg-emerald-200'
        bgIconColor.value = 'bg-emerald-500'
        textColor.value = 'text-emerald-500'
        darkBgColor.value = 'bg-emerald-500'
        break
      case 'teal':
        bgColor.value = 'bg-teal-100'
        bgHoverColor.value = 'hover:bg-teal-200'
        bgIconColor.value = 'bg-teal-500'
        textColor.value = 'text-teal-500'
        darkBgColor.value = 'bg-teal-500'
        break
      case 'sky':
        bgColor.value = 'bg-sky-100'
        bgHoverColor.value = 'hover:bg-sky-200'
        bgIconColor.value = 'bg-sky-500'
        textColor.value = 'text-sky-500'
        darkBgColor.value = 'bg-sky-500'
        break
      case 'violet':
        bgColor.value = 'bg-violet-100'
        bgHoverColor.value = 'hover:bg-violet-200'
        bgIconColor.value = 'bg-violet-500'
        textColor.value = 'text-violet-500'
        darkBgColor.value = 'bg-violet-500'
        break
      case 'fuchsia':
        bgColor.value = 'bg-fuchsia-100'
        bgHoverColor.value = 'hover:bg-fuchsia-200'
        bgIconColor.value = 'bg-fuchsia-500'
        textColor.value = 'text-fuchsia-500'
        darkBgColor.value = 'bg-fuchsia-500'
        break
      case 'rose':
        bgColor.value = 'bg-rose-100'
        bgHoverColor.value = 'hover:bg-rose-200'
        bgIconColor.value = 'bg-rose-500'
        textColor.value = 'text-rose-500'
        darkBgColor.value = 'bg-rose-500'
        break
      case 'indigo':
        bgColor.value = 'bg-indigo-100'
        bgHoverColor.value = 'hover:bg-indigo-200'
        bgIconColor.value = 'bg-indigo-500'
        textColor.value = 'text-indigo-500'
        darkBgColor.value = 'bg-indigo-500'
        break
      case 'yellow':
        bgColor.value = 'bg-yellow-100'
        bgHoverColor.value = 'hover:bg-yellow-200'
        bgIconColor.value = 'bg-yellow-500'
        textColor.value = 'text-yellow-500'
        darkBgColor.value = 'bg-yellow-500'
        break
      case 'green':
        bgColor.value = 'bg-green-100'
        bgHoverColor.value = 'hover:bg-green-200'
        bgIconColor.value = 'bg-green-500'
        textColor.value = 'text-green-500'
        darkBgColor.value = 'bg-green-500'
        break
      case 'blue':
        bgColor.value = 'bg-blue-100'
        bgHoverColor.value = 'hover:bg-blue-200'
        bgIconColor.value = 'bg-blue-500'
        textColor.value = 'text-blue-500'
        darkBgColor.value = 'bg-blue-500'
        break
      case 'purple':
        bgColor.value = 'bg-purple-100'
        bgHoverColor.value = 'hover:bg-purple-200'
        bgIconColor.value = 'bg-purple-500'
        textColor.value = 'text-purple-500'
        darkBgColor.value = 'bg-purple-500'
        break
      case 'pink':
        bgColor.value = 'bg-pink-100'
        bgHoverColor.value = 'hover:bg-pink-200'
        bgIconColor.value = 'bg-pink-500'
        textColor.value = 'text-pink-500'
        darkBgColor.value = 'bg-pink-500'
        break
      case 'gray':
        bgColor.value = 'bg-gray-100'
        bgHoverColor.value = 'hover:bg-gray-200'
        bgIconColor.value = 'bg-gray-500'
        textColor.value = 'text-gray-500'
        darkBgColor.value = 'bg-gray-500'
        break
      case 'cyan':
        bgColor.value = 'bg-cyan-100'
        bgHoverColor.value = 'hover:bg-cyan-200'
        bgIconColor.value = 'bg-cyan-500'
        textColor.value = 'text-cyan-500'
        darkBgColor.value = 'bg-cyan-500'
        break
      default:
        bgColor.value = 'bg-neutral-100'
        bgHoverColor.value = 'hover:bg-neutral-200'
        bgIconColor.value = 'bg-neutral-500'
        textColor.value = 'text-neutral-500'
        darkBgColor.value = 'bg-neutral-500'
        break
    }
  }

  return {
    bgColor,
    bgHoverColor,
    bgIconColor,
    textColor,
    darkBgColor,
    setColor,
  }
}
