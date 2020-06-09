# IDEAS

## Things we should be able to configure

- [ ] Disable changing opacity thing
- [ ] Disable scale change on swipe down/up
- [ ] Close lightbox animation can be just swipe down/up thing (iOS whats up), not into a small image
- [ ] Ability to set backdrop color
- [ ] Ability to set backdrop color per image (animate between)
- [ ] 

## Future API

### Standalone gallery

Gallery type which is displayed as a separate screen. It should have a pager and Image Transformer. Optionally, it should support swipe down/up to close.
Useful for small image galleries/previews such us product images.

```jsx
function ImageGalleryScreen() {
  const [showControls, setShowControls] = useState(true);
  const images = [{

  }]

  return (
    <StandaloneGallery
      images={images}
      imageComponent={Image}
      onChangeIndex={(nextIndex) => console.log(nextIndex)}
      onSingleTap={() => setShowControls(v => !v)}
    >
      {({ currentIndex, setIndex, }) => (
        {showControls && (
          <>
            <HeaderComponent onBack={goBack} />

            <FooterComponent image={images[currentIndex]} />
          </>
        )}
      )}
    </StandaloneGallery>
  );
}
```

### Lightbox


### Full featured gallery with shared element transition

