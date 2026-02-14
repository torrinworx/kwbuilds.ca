import { Icon, Observer } from 'destamatic-ui';

const ProfileCircle = ({
  imageUrl,
  size = 200,
  maxSize,
  minSize,
  borderWidth = 6,
}) => {
  const urlObs = imageUrl instanceof Observer.constructor
    ? imageUrl
    : Observer.immutable(imageUrl);

  const boxStyle = {
    width: size,
    maxWidth: maxSize,
    minWidth: minSize,
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    overflow: 'hidden',
    border: `${borderWidth}px solid $color`,
  };

  return urlObs.map(url => {
    if (!url) {
      return (
        <div
          theme="primary"
          style={{
            ...boxStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            style={{ color: '$color' }}
            name="feather:user"
            size="50%"
          />
        </div>
      );
    }

    return <div theme="primary" style={boxStyle}>
      <img
        src={url}
        alt="Profile"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>;
  }).unwrap();
};

export default ProfileCircle;
