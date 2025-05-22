// packages/ui/src/components/VidReamIcon.tsx
import React from 'react'
import { Svg, Path, Rect, SvgProps } from 'react-native-svg' // Import SvgProps for better typing
import { getTokenValue } from 'tamagui' // To resolve Tamagui tokens

// Define an interface for the component's props for better TypeScript support
interface VidReamIconProps extends SvgProps {
  width?: number
  height?: number
  rectFill?: string // Can be a color string (e.g., '#RRGGBB') or a Tamagui token string (e.g., '$colorName')
  pathFill?: string // Can be a color string or a Tamagui token string
  pathStroke?: string // Can be a color string or a Tamagui token string
}

const VidReamIcon: React.FC<VidReamIconProps> = ({
  width: widthProp = 48, // Default width if not provided
  height: heightProp = 48, // Default height if not provided
  rectFill: rectFillProp = '#138404', // Default color for the rectangle's fill
  pathFill: pathFillProp = '#FFFFFF', // Default color for the path's fill
  pathStroke: pathStrokeProp = '#000000', // Default color for the path's stroke (corrected from ##)
  ...props // Spread other SvgProps (like style, testID, etc.)
}) => {
  // Resolve Tamagui color tokens if the prop value is a string and starts with '$'
  // Otherwise, use the prop value directly (which includes the defaults if the prop wasn't passed)

  const finalRectFill =
    typeof rectFillProp === 'string' && rectFillProp.startsWith('$')
      ? getTokenValue(rectFillProp as any, 'color')
      : rectFillProp

  const finalPathFill =
    typeof pathFillProp === 'string' && pathFillProp.startsWith('$')
      ? getTokenValue(pathFillProp as any, 'color')
      : pathFillProp

  const finalPathStroke =
    typeof pathStrokeProp === 'string' && pathStrokeProp.startsWith('$')
      ? getTokenValue(pathStrokeProp as any, 'color')
      : pathStrokeProp

  return (
    <Svg width={widthProp} height={heightProp} viewBox="0 -4 32 32" {...props}>
      {/* The outer rectangle, its fill is now controlled by the rectFill prop */}
      <Rect width="24" height="16" x="1" y="3.5" rx="5" fill={finalRectFill} />
      {/* The inner triangle path */}
      <Path
        d="m10.5 7.5 6 4-6 4Z" // Path data for the triangle
        fill={finalPathFill} // Fill color for the triangle
        stroke={finalPathStroke} // Stroke color for the triangle
        strokeWidth="1.25" // Stroke width
        strokeLinejoin="round" // Rounds the corners where path segments meet
        strokeLinecap="round" // Rounds the ends of the path strokes
      />
    </Svg>
  )
}

export default VidReamIcon
